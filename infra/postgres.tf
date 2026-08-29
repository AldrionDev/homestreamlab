# App-owned Postgres workload. Single replica with the Recreate strategy:
# the homestreamlab-postgres-data PVC is ReadWriteOnce on a single-node
# local-path cluster, so two Pods must never mount it at once. postgres:16
# is hardcoded (like the PVC sizes in main.tf) — single-cluster, single
# purpose workspace.
resource "kubernetes_deployment_v1" "postgres" {
  metadata {
    name      = "homestreamlab-postgres"
    namespace = local.namespace
    labels    = local.postgres_labels
  }

  spec {
    replicas = "1"

    strategy {
      type = "Recreate"
    }

    selector {
      match_labels = local.postgres_selector
    }

    template {
      metadata {
        labels = local.postgres_labels
      }

      spec {
        container {
          name  = "postgres"
          image = "postgres:16"

          port {
            name           = "postgres"
            container_port = 5432
          }

          env {
            name = "POSTGRES_DB"
            value_from {
              secret_key_ref {
                name = local.secret_name
                key  = "POSTGRES_DB"
              }
            }
          }

          env {
            name = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = local.secret_name
                key  = "POSTGRES_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = local.secret_name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          # Keep the data in a subdirectory of the mount so the volume root
          # (which local-path may seed with lost+found-style entries) is not
          # the data directory itself.
          env {
            name  = "PGDATA"
            value = "/var/lib/postgresql/data/pgdata"
          }

          volume_mount {
            name       = "data"
            mount_path = "/var/lib/postgresql/data"
          }

          # exec probes do not expand $(VAR); pg_isready with no -U/-d still
          # reports whether the server is accepting connections.
          readiness_probe {
            exec {
              command = ["pg_isready", "-h", "127.0.0.1", "-p", "5432"]
            }
            initial_delay_seconds = 5
            period_seconds        = 10
            failure_threshold     = 6
          }

          liveness_probe {
            exec {
              command = ["pg_isready", "-h", "127.0.0.1", "-p", "5432"]
            }
            initial_delay_seconds = 30
            period_seconds        = 15
            failure_threshold     = 6
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "768Mi"
            }
          }
        }

        volume {
          name = "data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim_v1.postgres_data.metadata[0].name
          }
        }
      }
    }
  }
}

# Internal ClusterIP Service for Postgres. Consumed by the backend via the
# derived DATABASE_URL (locals.tf).
resource "kubernetes_service_v1" "postgres" {
  metadata {
    name      = "homestreamlab-postgres"
    namespace = local.namespace
    labels    = local.postgres_labels
  }

  spec {
    type     = "ClusterIP"
    selector = local.postgres_selector

    port {
      name        = "postgres"
      port        = 5432
      target_port = 5432
      protocol    = "TCP"
    }
  }
}
