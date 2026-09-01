# HomeStreamLab Terraform workspace

App-owned Terraform for HomeStreamLab, applied from this repository into the
`homestreamlab-k8s` HCP Terraform Cloud workspace. Follows `homelab-platform`'s
`<project>-k8s` naming and Local execution mode convention (ADR-0002, ADR-0001).

## Scope

This workspace reads the existing `homestreamlab` Namespace but does not
create, modify, or manage it. It manages the app Secret
(`homestreamlab-app-secrets`, see "Secrets" below), app-owned persistent
storage for Postgres data and uploads (see "Persistent storage" below), and
the app runtime workloads — Postgres, backend, and frontend Deployments plus
their internal ClusterIP Services (see "Workloads" below), and the Traefik
`IngressRoute` that exposes the app on the homelab LAN (see "Ingress" below).

It does not manage TLS, DNS, the Traefik installation or its CRDs/entrypoints,
Jenkins, RBAC, or any `homelab-platform` resource — those belong to other
issues / repositories.

## Ownership boundary

The `homestreamlab` Namespace and its ResourceQuota are created and owned by
the separate `homelab-platform` repository's own Terraform workspace
(`homelab-platform`). This workspace must never create, modify, or duplicate
those resources — it only reads the Namespace via a `kubernetes_namespace_v1`
data source in `main.tf`.

## Backend

State is stored remotely in HCP Terraform Cloud (`cloud` block in
`versions.tf`, workspace name `homestreamlab-k8s`). The HCP organization is
never committed — it is supplied via the `TF_CLOUD_ORGANIZATION` environment
variable.

Execution mode is **Local**: `terraform plan`/`apply` run on the operator's
own machine (the k3s API is LAN-only and unreachable by HCP's cloud runners).
Execution mode is workspace-side configuration and cannot be set from code.

## Manual prerequisite (before real init/plan)

1. In the HCP Terraform UI, create the `homestreamlab-k8s` workspace.
2. Set its execution mode to **Local**.
3. Confirm the organization/workspace naming matches the `cloud` block in
   `versions.tf`.

Only after that: `terraform login`, copy `terraform.tfvars.example` to
`terraform.tfvars` with a real `kubeconfig_path`, then run `terraform init`
and `terraform plan` for real. Expect a clean plan — a data source read only,
no resource changes, and no attempt to touch the Namespace/ResourceQuota.

## Secrets

`kubernetes_secret_v1.app` creates `homestreamlab-app-secrets` in the
existing `homestreamlab` namespace with five keys:

| Key | Source | Consumed by |
| --- | --- | --- |
| `JWT_SECRET` | `var.jwt_secret` (`sensitive`) | backend |
| `POSTGRES_DB` | `var.postgres_db` | Postgres container (honoured on first data-dir init only) |
| `POSTGRES_USER` | `var.postgres_user` | Postgres container (first init only) |
| `POSTGRES_PASSWORD` | `var.postgres_password` (`sensitive`) | Postgres container (first init only) |
| `DATABASE_URL` | derived in `locals.tf` from `postgres_user` / `postgres_password` / `postgres_db` + the `homestreamlab-postgres` Service name | backend + the migration init container |

The three `postgres_*` inputs are the single source of truth — they drive
both the Postgres container environment and the backend's `DATABASE_URL`.
They are validated to safe character sets (`postgres_user` / `postgres_db` =
unquoted Postgres identifiers, `postgres_password` = `[A-Za-z0-9_-]`) so the
derived URL needs no escaping. This is a deliberate MVP simplification, not a
Terraform limitation: `urlencode()` exists — wrap the interpolation in
`locals.tf` with it if arbitrary credentials ever become a requirement.

`jwt_secret` and `postgres_password` are `sensitive = true` with no default.

**HCP Terraform workspace variables do not work for this workspace.**
HCP Terraform's own docs are explicit: "HCP Terraform does not evaluate
workspace variables or variable sets in local execution mode" — the
Variables page isn't even available in the UI for a Local execution mode
workspace. Since `homestreamlab-k8s` is pinned to Local execution (see
"Backend" above), these inputs must be supplied on the operator's own
machine instead. The same applies to `backend_image` / `frontend_image`
(not secret, but still workspace inputs).

- **Primary**: add real values to a gitignored `terraform.tfvars`, the same
  file already used for `kubeconfig_path` — copy from
  `terraform.tfvars.example` and fill them in.
- **Fallback**: temporary `TF_VAR_jwt_secret` / `TF_VAR_postgres_db` /
  `TF_VAR_postgres_user` / `TF_VAR_postgres_password` /
  `TF_VAR_backend_image` / `TF_VAR_frontend_image` exports for a single
  session only — never added to `.bashrc`/`.zshrc` or any persisted shell
  config.
- Never commit real values to `terraform.tfvars` or any `.tfvars` file.

**State still contains the values.** Terraform stores all resource
arguments — including these two secret values — in state. That state is
held remotely by HCP Terraform (see "Backend" above) regardless of how the
values were supplied locally, so access to the `homestreamlab-k8s` workspace
and its state must itself be treated as sensitive. This is inherent to any
Terraform-managed Kubernetes Secret, not specific to how these values are
sourced.

### Verifying without exposing values

- `terraform plan`/`apply` redact `data` automatically (the provider marks
  it Sensitive) — look for `(sensitive value)`, never plaintext.
- `kubectl describe secret -n homestreamlab homestreamlab-app-secrets` shows
  key names and byte sizes only.
- Avoid `kubectl get secret ... -o yaml` / `-o json` / `-o
  jsonpath='{.data}'` — those print base64-encoded (trivially decodable)
  values.

## Persistent storage

`kubernetes_persistent_volume_claim_v1.postgres_data` and `.uploads` create
`homestreamlab-postgres-data` (20Gi) and `homestreamlab-uploads` (10Gi) in
the `homestreamlab` namespace, using k3s's built-in `local-path`
StorageClass (`ReadWriteOnce`). Both are app-owned by this repo's
Terraform, distinct from the platform-owned Namespace/ResourceQuota — see
"Ownership boundary" above.

**Single-node/local-lab only.** `local-path` provisions storage on
whichever node the consuming Pod is scheduled to and has no replication —
it is not suitable beyond a single-node k3s cluster. No backup wiring,
multi-node replication, or cloud storage is in scope here.

**`storage_class_name` and sizes are hardcoded, not variables** — this is a
single-cluster, single-purpose workspace; `local-path` is the only
StorageClass this cluster offers.

**`WaitForFirstConsumer` binding mode.** The `local-path` StorageClass
binds a PVC only once a Pod mounts it (`kubectl describe storageclass
local-path` shows `VolumeBindingMode: WaitForFirstConsumer`). Until the
Postgres/backend Deployments exist (later issues), these PVCs will show
`Pending` after `terraform apply` — that is expected, not a failure. Both
resources set `wait_until_bound = false` so `terraform apply` does not hang
waiting for a `Bound` status that can't happen yet.

**No volume expansion.** `local-path` reports `AllowVolumeExpansion:
false`. Growing `homestreamlab-postgres-data`/`homestreamlab-uploads` later
requires provisioning a new, larger PVC and migrating data — not an
in-place `terraform apply` resize.

## Workloads

`postgres.tf`, `backend.tf`, and `frontend.tf` define the app runtime.

| Deployment / Service | Image | Service (ClusterIP) | Storage | Strategy |
| --- | --- | --- | --- | --- |
| `homestreamlab-postgres` | `postgres:16` (hardcoded) | `5432` | `homestreamlab-postgres-data` at `/var/lib/postgresql/data` (`PGDATA` subdir) | `Recreate` |
| `homestreamlab-backend` | `var.backend_image` | `3000` | `homestreamlab-uploads` at `/app/uploads` | `Recreate` |
| `homestreamlab-frontend` | `var.frontend_image` | `8080` | none | default (RollingUpdate) |

All are single-replica, scoped to single-node local-lab use. `Recreate` is
required for Postgres and backend because their PVCs are `ReadWriteOnce` on a
single node; the frontend is stateless and stays on the default strategy (its
one-Pod rollout surge fits the namespace ResourceQuota). The frontend Service
is the fallback target of the Traefik IngressRoute (see "Ingress").

**Images.** `backend_image` / `frontend_image` are full
`[registry[:port]/]repository:tag` references with an explicit tag other than
`latest` — enforced by variable validation, which allows a `:port` on the
registry. They follow the shared `local-jenkins-platform` OCI consumer
contract: `<registry>/homestreamlab/<component>:<git-sha>` (e.g.
`192.168.1.100:5000/homestreamlab/backend:<git-sha>`) — **not** a flat
`homestreamlab-backend` name. The Jenkins pipeline (`Jenkinsfile`, repo root)
passes git-SHA tags. For a manual local plan/apply, supply them the same way
as the secrets. `postgres:16` is hardcoded, like the PVC sizes — this is a
single-cluster, single-purpose workspace.

**Migrations.** `prisma` is a runtime dependency of the backend
(`backend/package.json`), so `prisma migrate deploy` is present in the pruned
production image. The backend Deployment runs it in an init container
(`node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma`,
`DATABASE_URL` from the Secret). The init container runs to completion before
the app container starts; if Postgres is not reachable yet on the first
apply it exits non-zero and the kubelet retries it with backoff — the Pod
shows `Init:Error` / `Init:CrashLoopBackOff` until Postgres is `Ready`, then
migrations apply and the app container starts. This is the ordering gate; the
backend's `startup_probe` only covers Nest bootstrap afterwards.
`prisma.config.ts` is intentionally absent from the runtime image (it imports
a dev-only `dotenv`) — `--schema` plus the `DATABASE_URL` env var are enough
for the CLI.

**Probes.** Postgres: `pg_isready -h 127.0.0.1 -p 5432` (an `exec` probe;
args are not `$(VAR)`-expanded, so no `-U`/`-d`). Backend: `GET /health` for
startup / readiness / liveness. Frontend: `GET /` for readiness / liveness.

**Resources.** Every container and init container sets both `requests` and
`limits` (required once the namespace ResourceQuota constrains totals).
Effective per-Pod requests follow Kubernetes init-container semantics
(`max(max(initContainers), sum(containers))`), so the migrate init container
(50m / 128Mi) never adds to the backend Pod (100m / 256Mi). Namespace
totals are roughly 225m CPU / 544Mi requests and 1100m CPU / 1408Mi limits —
re-check against `kubectl describe resourcequota -n homestreamlab` and tune.

**First apply.** The two PVCs move from `Pending` to `Bound` as their
consuming Pods are scheduled (`local-path` is `WaitForFirstConsumer`).

**Frontend API URL.** `VITE_API_URL` is baked into the frontend image at
build time (there is no runtime config lookup). For the LAN deployment the
image must be built with
`--build-arg VITE_API_URL=http://homestreamlab.homelab.home.arpa` so the
browser calls the API on the same origin it loaded the SPA from (see
"Ingress"). Then set `frontend_image` to that build's tag.

## Jenkins pipeline

The root `Jenkinsfile` is the gated home lab delivery pipeline: it builds and
publishes SHA-tagged `homestreamlab/backend` / `homestreamlab/frontend` images
(see "Images"), runs `terraform plan -out=tfplan`, pauses at a human approval
gate, then applies that exact saved plan. It never writes or modifies a tracked
`.tf` or `.tfvars` file — every input below reaches Terraform purely through
process environment at plan time:

* `backend_image` / `frontend_image` / `kubeconfig_path` / `kube_context` are
  set as `TF_VAR_*` from the computed image refs and from the
  `k3s-homestreamlab` credential bound for the pipeline run;
* `jwt_secret` and `postgres_password` come from the Jenkins Secret Text
  credentials `homestreamlab-jwt-secret` / `homestreamlab-postgres-password`
  (provisioned by `local-jenkins-platform`'s consumer application secret
  contract), bound only around the `terraform plan` step via
  `withCredentials`;
* `postgres_db` / `postgres_user` are **consumer-owned non-secret
  configuration** — the `local-jenkins-platform` contract explicitly forbids
  making them a Jenkins credential, Docker secret or platform environment
  variable, so the `Jenkinsfile` declares them directly (`environment {}`
  block). They must stay stable across applies — see "Secrets" above.

Publishing the two SHA-tagged images to the local registry happens
**before** the approval gate. This is deliberate: it is a registry write, not
a Terraform or Kubernetes deployment mutation, so it is outside the scope the
gate protects (and the pipeline's write-once precheck ensures it only ever
creates the two tags, never overwrites one). The gate blocks
`terraform apply` only.

## Ingress

`ingress.tf` defines one Traefik `IngressRoute` (`kubernetes_manifest`,
`traefik.io/v1alpha1`) named `homestreamlab` in the `homestreamlab`
namespace. It binds to the platform Traefik HTTP entrypoint (`web`, plain
HTTP :80 — no TLS) and answers on `var.ingress_host`
(`homestreamlab.homelab.home.arpa` by default), which resolves via
`homelab-platform`'s dnsmasq wildcard `*.homelab.home.arpa`.

**Same-origin model.** The SPA and its API share the one hostname. Two
routes, evaluated by explicit priority:

| Priority | Match | Service |
| --- | --- | --- |
| 20 | `Host` + `PathPrefix(/auth)` \|\| `PathPrefix(/media)` \|\| `PathPrefix(/uploads)` | `homestreamlab-backend:http` (3000) |
| 10 | `Host` (catch-all) | `homestreamlab-frontend:http` (8080) |

The SPA's own client routes live under `/app/*` and do not collide with the
backend prefixes. Because API and upload calls then hit the same origin as
the SPA, no CORS is involved and the backend needs no `FRONTEND_ORIGIN`
change. The backend's Swagger UI (`/api`) and `/health` are deliberately
**not** exposed through the IngressRoute — they are not needed by the
browser app and stay cluster-internal. A future top-level SPA route named
`/auth`, `/media`, or `/uploads` would be shadowed by the backend route;
keep new SPA routes under `/app`.

**Ownership.** Traefik itself, its CRDs, and its entrypoints are owned by
`homelab-platform`; this workspace only creates the `IngressRoute` instance.
The CRD group/version (`traefik.io/v1alpha1`) and entrypoint name (`web`)
were confirmed against the live cluster (Traefik v3.7 on k3s).

**Plan/apply reach the cluster.** `kubernetes_manifest` fetches the CRD
schema from the API server at plan time, so `terraform plan`/`apply` must
run on the LAN (already required for this Local-execution workspace).
`./validate.sh` stays offline — `terraform validate` does not contact the
cluster.

## Local validation (no backend, no cluster)

```sh
./validate.sh
```

Runs `terraform fmt -check`, `terraform init -backend=false`, and
`terraform validate`. Contacts the public Terraform provider registry, but
never HCP Terraform and never the cluster.
