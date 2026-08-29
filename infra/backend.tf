# App-owned backend (NestJS) workload. Single replica with the Recreate
# strategy: the homestreamlab-uploads PVC is ReadWriteOnce on a single-node
# local-path cluster.
#
# Migrations run in an init container from the same image: `prisma` is a
# runtime dependency (backend/package.json), so `prisma migrate deploy` is
# available in the pruned production image. The init container runs to
# completion before the app container starts; if Postgres is not reachable
# yet it exits non-zero and the kubelet retries it with backoff
# (Init:CrashLoopBackOff) until it succeeds. prisma.config.ts is not in the
# runtime image, so `--schema` + the DATABASE_URL env var drive the CLI.
resource "kubernetes_deployment_v1" "backend" {
  metadata {
    name      = "homestreamlab-backend"
    namespace = local.namespace
    labels    = local.backend_labels
  }

  spec {
    replicas = "1"

    strategy {
      type = "Recreate"
    }

    selector {
      match_labels = local.backend_selector
    }

    template {
      metadata {
        labels = local.backend_labels
      }

      spec {
        # The image runs as uid/gid 1000 (node). fs_group makes the kubelet
        # chown the uploads volume to gid 1000 so the process can write to
        # it — the local-path directory is otherwise root-owned.
        security_context {
          run_as_user  = 1000
          run_as_group = 1000
          fs_group     = 1000
        }

        # The homestreamlab-uploads PVC mounts over /app/uploads and shadows
        # the photos/videos/documents subdirectories baked into the image.
        # multer's diskStorage (function destination) does not create them,
        # so recreate them here before the app starts. Idempotent.
        init_container {
          name    = "init-uploads-dirs"
          image   = var.backend_image
          command = ["sh", "-c", "mkdir -p /app/uploads/photos /app/uploads/videos /app/uploads/documents"]

          volume_mount {
            name       = "uploads"
            mount_path = "/app/uploads"
          }

          resources {
            requests = {
              cpu    = "10m"
              memory = "16Mi"
            }
            limits = {
              cpu    = "50m"
              memory = "32Mi"
            }
          }
        }

        init_container {
          name        = "migrate"
          image       = var.backend_image
          working_dir = "/app"
          command     = ["node_modules/.bin/prisma", "migrate", "deploy", "--schema=prisma/schema.prisma"]

          env {
            name = "DATABASE_URL"
            value_from {
              secret_key_ref {
                name = local.secret_name
                key  = "DATABASE_URL"
              }
            }
          }

          resources {
            requests = {
              cpu    = "50m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }
        }

        container {
          name  = "backend"
          image = var.backend_image

          port {
            name           = "http"
            container_port = 3000
          }

          env {
            name  = "PORT"
            value = "3000"
          }

          env {
            name = "DATABASE_URL"
            value_from {
              secret_key_ref {
                name = local.secret_name
                key  = "DATABASE_URL"
              }
            }
          }

          env {
            name = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = local.secret_name
                key  = "JWT_SECRET"
              }
            }
          }

          volume_mount {
            name       = "uploads"
            mount_path = "/app/uploads"
          }

          # Covers Nest bootstrap only (Prisma $connect + HTTP listen).
          # Migrations already finished in the init container before this
          # container starts, so this probe never waits on them.
          startup_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            period_seconds    = 5
            failure_threshold = 18
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            period_seconds    = 10
            failure_threshold = 6
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            period_seconds    = 20
            failure_threshold = 6
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }
        }

        volume {
          name = "uploads"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim_v1.uploads.metadata[0].name
          }
        }
      }
    }
  }
}

# Internal ClusterIP Service for the backend API.
resource "kubernetes_service_v1" "backend" {
  metadata {
    name      = "homestreamlab-backend"
    namespace = local.namespace
    labels    = local.backend_labels
  }

  spec {
    type     = "ClusterIP"
    selector = local.backend_selector

    port {
      name        = "http"
      port        = 3000
      target_port = 3000
      protocol    = "TCP"
    }
  }
}
