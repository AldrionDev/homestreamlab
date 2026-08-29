# App-owned frontend workload: the nginx-unprivileged image serving the
# built React SPA on port 8080. Stateless, no volumes — left on the default
# RollingUpdate strategy (the one-Pod surge fits the namespace ResourceQuota).
resource "kubernetes_deployment_v1" "frontend" {
  metadata {
    name      = "homestreamlab-frontend"
    namespace = local.namespace
    labels    = local.frontend_labels
  }

  spec {
    replicas = "1"

    selector {
      match_labels = local.frontend_selector
    }

    template {
      metadata {
        labels = local.frontend_labels
      }

      spec {
        container {
          name  = "frontend"
          image = var.frontend_image

          port {
            name           = "http"
            container_port = 8080
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 8080
            }
            initial_delay_seconds = 5
            period_seconds        = 10
            failure_threshold     = 6
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 8080
            }
            initial_delay_seconds = 10
            period_seconds        = 15
            failure_threshold     = 6
          }

          resources {
            requests = {
              cpu    = "25m"
              memory = "32Mi"
            }
            limits = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }
        }
      }
    }
  }
}

# Internal ClusterIP Service for the frontend. This is the target the #133
# Traefik IngressRoute will route to.
resource "kubernetes_service_v1" "frontend" {
  metadata {
    name      = "homestreamlab-frontend"
    namespace = local.namespace
    labels    = local.frontend_labels
  }

  spec {
    type     = "ClusterIP"
    selector = local.frontend_selector

    port {
      name        = "http"
      port        = 8080
      target_port = 8080
      protocol    = "TCP"
    }
  }
}
