# Reads the existing `homestreamlab` Namespace, applied and owned by the
# `homelab-platform` repo's own workspace. This workspace must never create
# or modify the Namespace/ResourceQuota itself — see README.md.
data "kubernetes_namespace_v1" "homestreamlab" {
  metadata {
    name = "homestreamlab"
  }
}

# Single source of truth for app + Postgres runtime configuration. Postgres
# reads POSTGRES_DB/USER/PASSWORD; the backend reads DATABASE_URL (derived
# from the same three values in locals.tf) and JWT_SECRET. See README.md
# "Secrets" for how the sensitive inputs are supplied under Local execution
# mode (gitignored terraform.tfvars or TF_VAR_*).
resource "kubernetes_secret_v1" "app" {
  metadata {
    name      = "homestreamlab-app-secrets"
    namespace = data.kubernetes_namespace_v1.homestreamlab.metadata[0].name
  }

  data = {
    JWT_SECRET        = var.jwt_secret
    POSTGRES_DB       = var.postgres_db
    POSTGRES_USER     = var.postgres_user
    POSTGRES_PASSWORD = var.postgres_password
    DATABASE_URL      = local.database_url
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
