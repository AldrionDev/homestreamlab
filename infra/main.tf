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

# App-owned persistent storage for Postgres data. Single-node local-lab
# only (local-path StorageClass, WaitForFirstConsumer) — see README.md.
resource "kubernetes_persistent_volume_claim_v1" "postgres_data" {
  metadata {
    name      = "homestreamlab-postgres-data"
    namespace = data.kubernetes_namespace_v1.homestreamlab.metadata[0].name
  }

  # local-path uses WaitForFirstConsumer: the PVC stays Pending until a Pod
  # mounts it. Without this, apply would hang waiting for Bound status.
  wait_until_bound = false

  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = "local-path"

    resources {
      requests = {
        storage = "20Gi"
      }
    }
  }
}

# App-owned persistent storage for uploaded files (uploads/).
resource "kubernetes_persistent_volume_claim_v1" "uploads" {
  metadata {
    name      = "homestreamlab-uploads"
    namespace = data.kubernetes_namespace_v1.homestreamlab.metadata[0].name
  }

  wait_until_bound = false

  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = "local-path"

    resources {
      requests = {
        storage = "10Gi"
      }
    }
  }
}
