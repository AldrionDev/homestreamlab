# HomeStreamLab Terraform workspace

App-owned Terraform for HomeStreamLab, applied from this repository into the
`homestreamlab-k8s` HCP Terraform Cloud workspace. Follows `homelab-platform`'s
`<project>-k8s` naming and Local execution mode convention (ADR-0002, ADR-0001).

## Scope

This workspace reads the existing `homestreamlab` Namespace but does not
create, modify, or manage it, and manages the backend's app secrets
(`homestreamlab-app-secrets`, see "Secrets" below). It does not yet manage
any other application resources (Deployment/Service/IngressRoute/PVC) —
those belong to later issues.

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
existing `homestreamlab` namespace, with two keys consumed by the backend:
`JWT_SECRET` and `DATABASE_URL`.

Values come from the Terraform input variables `jwt_secret` and
`database_url` (both `sensitive = true`, no default).

**HCP Terraform workspace variables do not work for this workspace.**
HCP Terraform's own docs are explicit: "HCP Terraform does not evaluate
workspace variables or variable sets in local execution mode" — the
Variables page isn't even available in the UI for a Local execution mode
workspace. Since `homestreamlab-k8s` is pinned to Local execution (see
"Backend" above), these two variables must be supplied on the operator's own
machine instead:

- **Primary**: add real values to a gitignored `terraform.tfvars`, the same
  file already used for `kubeconfig_path` — copy from
  `terraform.tfvars.example` and fill in both.
- **Fallback**: a temporary `TF_VAR_jwt_secret` / `TF_VAR_database_url`
  export for a single session only — never added to `.bashrc`/`.zshrc` or
  any persisted shell config.
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

## Local validation (no backend, no cluster)

```sh
./validate.sh
```

Runs `terraform fmt -check`, `terraform init -backend=false`, and
`terraform validate`. Contacts the public Terraform provider registry, but
never HCP Terraform and never the cluster.
