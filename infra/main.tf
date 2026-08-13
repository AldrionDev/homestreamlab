# Reads the existing `homestreamlab` Namespace, applied and owned by the
# `homelab-platform` repo's own workspace. This workspace must never create
# or modify the Namespace/ResourceQuota itself — see README.md.
data "kubernetes_namespace_v1" "homestreamlab" {
  metadata {
    name = "homestreamlab"
  }
}
