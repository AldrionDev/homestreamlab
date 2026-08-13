# HomeStreamLab Terraform workspace

App-owned Terraform for HomeStreamLab, applied from this repository into the
`homestreamlab-k8s` HCP Terraform Cloud workspace. Follows `homelab-platform`'s
`<project>-k8s` naming and Local execution mode convention (ADR-0002, ADR-0001).

## Scope

This is a minimal, data-source-only scaffold. It reads the existing
`homestreamlab` Namespace but does not create, modify, or manage it, and does
not yet manage any application resources (Deployment/Service/IngressRoute/
Secret/PVC) — those belong to later issues.

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

## Local validation (no backend, no cluster)

```sh
./validate.sh
```

Runs `terraform fmt -check`, `terraform init -backend=false`, and
`terraform validate`. Contacts the public Terraform provider registry, but
never HCP Terraform and never the cluster.
