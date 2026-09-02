# HomeStreamLab deployment path

This page is the overview of how HomeStreamLab is delivered to its only deployment
target: an optional **LAN-only home lab k3s cluster**. Local development remains the
default workflow and is covered by the root [`README.md`](../README.md).

It deliberately does not repeat the details that already live elsewhere:

- Platform-level detail (k3s, local registry, DNS, Traefik, namespace + quota) lives in
  the [`homelab-platform`](https://github.com/AldrionDev/homelab-platform) repository.
- The Terraform workspace and the Jenkins pipeline contract live in
  [`infra/README.md`](../infra/README.md).

## Components and ownership

| Component | Owned by | Role |
| --- | --- | --- |
| GitHub Actions (`.github/workflows/ci.yml`) | this repo | Required PR quality gate — `Backend` and `Frontend` jobs. |
| Jenkins pipeline (root `Jenkinsfile`) | this repo (build + deploy intent) | Gated home lab delivery: build → publish → `terraform plan` → human approval → `terraform apply` → verify. |
| Jenkins controller + delivery capabilities (docker, buildx, terraform, kubectl, `homelab-preflight`), credential mechanism | `local-jenkins-platform` | Runs the pipeline (`projects/homestreamlab`); provides the credential contract. |
| Local container registry | `homelab-platform` | Holds the SHA-tagged backend/frontend images. No authentication. |
| `homelab-platform` (k3s, registry + registry trust, dnsmasq wildcard DNS, Traefik install + CRDs + entrypoints, `homestreamlab` Namespace + ResourceQuota) | `homelab-platform` | The reusable platform layer. This repo reads the Namespace but never manages it. |
| `homestreamlab-k8s` Terraform workspace (`infra/`) | this repo | App-owned Kubernetes resources: app Secret, PVCs, Postgres/backend/frontend Deployments + Services, Traefik `IngressRoute`. HCP Terraform Cloud holds **state only**; execution mode is **Local**. |
| Local persistent storage | this repo (`infra/`) | Two `local-path` PVCs — Postgres data and uploads. |

## CI vs. CD — the current split

**CI (GitHub Actions) is the required gate.** Branch protection on `main` requires a pull
request and exactly two status checks — `Backend` and `Frontend` — both produced by
`.github/workflows/ci.yml`. Jenkins is **not** a required GitHub check.

**CD (Jenkins) is the gated deploy runner.** The root `Jenkinsfile` is wired and the full
delivery path has been run end to end against the live home lab. It is not a GitHub status
check because the local Jenkins controller cannot report check results back to GitHub. That
is the sole reason GitHub Actions remains the required PR gate; branch protection may be
revisited if Jenkins gains check-reporting.

## Deployment path (proven)

```
GitHub PR
  → GitHub Actions (Backend + Frontend, required)   ── CI gate
  → merge to main
  → Jenkins pipeline (local-jenkins-platform, projects/homestreamlab)
      checkout / identify revision
      preflight (homelab-preflight)
      release-tag write-once precheck
      build backend + frontend images
      publish images to the local registry        ── before the approval gate
      terraform init / validate
      terraform plan  (-out=tfplan)
      ── human approval gate ──
      terraform apply  (the exact saved plan)
      verify the live rollout
  → k3s (homestreamlab namespace)
  → Traefik IngressRoute (web entrypoint, plain HTTP :80)
  → dnsmasq wildcard DNS + UFW
  → LAN client at http://homestreamlab.homelab.home.arpa
```

Key facts:

- **Images use immutable git-SHA tags:**
  `<registry>/homestreamlab/backend:<git-sha>` and
  `<registry>/homestreamlab/frontend:<git-sha>`. Never a flat `homestreamlab-backend`
  name, never only `latest`. A write-once precheck prevents overwriting an existing tag.
- **Terraform deploy is `plan` → human approval → `apply`** of the exact saved plan.
- The pipeline never writes or modifies a tracked `.tf` / `.tfvars` file; image references
  and kubeconfig path/context reach Terraform only through `TF_VAR_*` environment
  variables at plan time.
- Application secrets (`jwt_secret`, `postgres_password`) and the deployer identity
  (`k3s-homestreamlab`) are established `local-jenkins-platform` credential contracts;
  `postgres_db` / `postgres_user` are consumer-owned non-secret config declared in the
  `Jenkinsfile`. See [`infra/README.md`](../infra/README.md#secrets) and
  [`infra/README.md`](../infra/README.md#jenkins-pipeline) — they are not restated here.
- Same-origin routing: Traefik sends `/auth`, `/media`, `/uploads` to the backend Service
  and everything else to the frontend, so the frontend image is built with
  `--build-arg VITE_API_URL=http://homestreamlab.homelab.home.arpa`. See
  [`infra/README.md`](../infra/README.md#ingress).

## DNS

The app is reachable at **`http://homestreamlab.homelab.home.arpa`** — a subdomain of the
platform's wildcard domain **`homelab.home.arpa`**, resolved by `homelab-platform`'s
dnsmasq. `.local` is intentionally avoided because it is commonly used and reserved for
mDNS; the platform's choice of `homelab.home.arpa` is recorded in `homelab-platform`
ADR-0005.

## Persistent storage

Two app-owned PersistentVolumeClaims on k3s's built-in `local-path` StorageClass —
Postgres data and uploads. `ReadWriteOnce`, single node, no replication, no volume
expansion, and no backup wiring: backups are local only. Sizes and binding behaviour are
in [`infra/README.md`](../infra/README.md#persistent-storage).

## Known limits

- **No TLS** — plain HTTP only.
- **LAN-only** — no public or internet-facing exposure.
- **Single-node k3s** — no multi-node, no rescheduling across nodes.
- **No cloud deployment** — no AWS / EKS / ECS / RDS / CloudFront path.
- **No registry authentication** — the local registry is open on the LAN.
- **Local backups only** — no off-site or automated backup of Postgres data or uploads.
- **No GitOps** — no ArgoCD or Flux; deployment is Jenkins-driven with a manual approval.
- **No monitoring stack** — no Prometheus, Grafana, alerting, or log aggregation.

## See also

- [`README.md`](../README.md) — project overview and local development.
- [`infra/README.md`](../infra/README.md) — Terraform workspace and Jenkins pipeline contract.
- [`homelab-platform`](https://github.com/AldrionDev/homelab-platform) — the reusable platform layer.
- `local-jenkins-platform` — the Jenkins controller and credential contracts.
- [GitHub Milestones](https://github.com/AldrionDev/homestreamlab/milestones) — milestone / issue breakdown.
