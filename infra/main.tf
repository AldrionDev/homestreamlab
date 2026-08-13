# Reads the existing `homestreamlab` Namespace, applied and owned by the
# `homelab-platform` repo's own workspace. This workspace must never create
# or modify the Namespace/ResourceQuota itself — see README.md.
data "kubernetes_namespace_v1" "homestreamlab" {
  metadata {
    name = "homestreamlab"
  }
}

# App secrets for the backend, sourced from HCP Terraform sensitive
# variables. See README.md "Secrets" for how jwt_secret/database_url are
# supplied.
resource "kubernetes_secret_v1" "app" {
  metadata {
    name      = "homestreamlab-app-secrets"
    namespace = data.kubernetes_namespace_v1.homestreamlab.metadata[0].name
  }

  data = {
    JWT_SECRET   = var.jwt_secret
    DATABASE_URL = var.database_url
  }
}
