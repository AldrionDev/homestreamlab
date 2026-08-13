variable "kubeconfig_path" {
  description = <<-EOT
    Absolute path to a kubeconfig for the homelab's k3s cluster, readable by
    the user running Terraform. Machine-specific: supply it from a gitignored
    terraform.tfvars (or TF_VAR_kubeconfig_path). Never commit a real path.
  EOT
  type        = string

  validation {
    condition     = startswith(var.kubeconfig_path, "/")
    error_message = "kubeconfig_path must be an absolute path."
  }
}

variable "kube_context" {
  description = "kubeconfig context to use. k3s generates a single context named \"default\"."
  type        = string
  default     = "default"
}

variable "jwt_secret" {
  description = <<-EOT
    JWT signing secret for the backend, stored as the JWT_SECRET key of the
    homestreamlab-app-secrets Kubernetes Secret. This workspace uses Local
    execution mode, so HCP Terraform never evaluates workspace variables for
    it — supply this from a gitignored terraform.tfvars (or
    TF_VAR_jwt_secret for a single session). Never commit a real value.
  EOT
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.jwt_secret) > 0
    error_message = "jwt_secret must not be empty."
  }
}

variable "database_url" {
  description = <<-EOT
    Postgres connection string for the backend, stored as the DATABASE_URL
    key of the homestreamlab-app-secrets Kubernetes Secret. This workspace
    uses Local execution mode, so HCP Terraform never evaluates workspace
    variables for it — supply this from a gitignored terraform.tfvars (or
    TF_VAR_database_url for a single session). Never commit a real value.
  EOT
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.database_url) > 0
    error_message = "database_url must not be empty."
  }
}
