locals {
  namespace = data.kubernetes_namespace_v1.homestreamlab.metadata[0].name

  # ClusterIP Service name for Postgres — also the host in the derived
  # DATABASE_URL below. Backend and Postgres resolve it within the namespace.
  postgres_service_name = "homestreamlab-postgres"

  secret_name = kubernetes_secret_v1.app.metadata[0].name

  # Labels applied to every workload/Service this workspace manages.
  common_labels = {
    "app.kubernetes.io/part-of"    = "homestreamlab"
    "app.kubernetes.io/managed-by" = "terraform"
  }

  # Per-component label sets. The selector for each Deployment/Service uses
  # only { name, component } so it stays stable (selectors are immutable).
  postgres_labels = merge(local.common_labels, {
    "app.kubernetes.io/name"      = "homestreamlab"
    "app.kubernetes.io/component" = "postgres"
  })
  backend_labels = merge(local.common_labels, {
    "app.kubernetes.io/name"      = "homestreamlab"
    "app.kubernetes.io/component" = "backend"
  })
  frontend_labels = merge(local.common_labels, {
    "app.kubernetes.io/name"      = "homestreamlab"
    "app.kubernetes.io/component" = "frontend"
  })

  postgres_selector = {
    "app.kubernetes.io/name"      = "homestreamlab"
    "app.kubernetes.io/component" = "postgres"
  }
  backend_selector = {
    "app.kubernetes.io/name"      = "homestreamlab"
    "app.kubernetes.io/component" = "backend"
  }
  frontend_selector = {
    "app.kubernetes.io/name"      = "homestreamlab"
    "app.kubernetes.io/component" = "frontend"
  }

  # Single source of truth: the discrete Postgres settings drive both the
  # Postgres container env and the backend's DATABASE_URL. user / db /
  # password are validated to safe character sets in variables.tf so the URL
  # needs no escaping — a deliberate MVP simplification. urlencode() is the
  # documented upgrade path if arbitrary credentials ever become a need.
  database_url = "postgresql://${var.postgres_user}:${var.postgres_password}@${local.postgres_service_name}:5432/${var.postgres_db}?schema=public"
}
