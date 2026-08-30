# App-owned Traefik IngressRoute exposing HomeStreamLab on the homelab LAN at
# http://${var.ingress_host} (plain HTTP, no TLS). Traefik itself, its CRDs, the
# entrypoints, and the *.homelab.home.arpa wildcard DNS are owned by the
# homelab-platform repo — this workspace only creates the IngressRoute instance,
# alongside the app Services it targets.
#
# Same-origin routing model: the SPA and its API are served from one hostname.
# Backend path prefixes (/auth, /media, /uploads) are proxied to the backend
# Service; every other path falls through to the frontend SPA Service (its own
# client routes live under /app, so they do not collide). Because the browser
# then calls the API on the same origin it loaded the SPA from, no CORS handling
# is involved and the backend needs no FRONTEND_ORIGIN change. This does mean the
# frontend image must be built with VITE_API_URL = http://${var.ingress_host}
# (see README.md "Ingress").
#
# Confirmed against the live cluster before writing this file (Traefik v3.7 on
# k3s): CRD group/version is traefik.io/v1alpha1, and the HTTP entrypoint is
# named "web" (Traefik Service maps :80 -> web; "websecure" carries TLS).
resource "kubernetes_manifest" "ingressroute" {
  manifest = {
    apiVersion = "traefik.io/v1alpha1"
    kind       = "IngressRoute"

    metadata = {
      name      = "homestreamlab"
      namespace = local.namespace
      labels    = local.common_labels
    }

    spec = {
      entryPoints = [var.traefik_entrypoint]

      routes = [
        {
          # Backend API + uploaded media. Explicit higher priority (and a longer
          # rule) so this always wins over the catch-all below.
          match    = "Host(`${var.ingress_host}`) && (PathPrefix(`/auth`) || PathPrefix(`/media`) || PathPrefix(`/uploads`))"
          kind     = "Rule"
          priority = 20
          services = [
            {
              name = kubernetes_service_v1.backend.metadata[0].name
              port = "http"
            },
          ]
        },
        {
          # Everything else -> the static SPA served by nginx.
          match    = "Host(`${var.ingress_host}`)"
          kind     = "Rule"
          priority = 10
          services = [
            {
              name = kubernetes_service_v1.frontend.metadata[0].name
              port = "http"
            },
          ]
        },
      ]
    }
  }
}
