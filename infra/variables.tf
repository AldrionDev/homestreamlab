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

variable "postgres_db" {
  description = <<-EOT
    Postgres database name. Stored as the POSTGRES_DB key of
    homestreamlab-app-secrets and interpolated into the derived DATABASE_URL
    (see locals.tf). Supply from a gitignored terraform.tfvars (or
    TF_VAR_postgres_db) — this workspace uses Local execution mode.
  EOT
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z_][A-Za-z0-9_]*$", var.postgres_db))
    error_message = "postgres_db must be a valid unquoted Postgres identifier (letters, digits, underscore; not starting with a digit). This is a deliberate MVP simplification so DATABASE_URL needs no escaping."
  }
}

variable "postgres_user" {
  description = <<-EOT
    Postgres role name. Stored as the POSTGRES_USER key of
    homestreamlab-app-secrets and interpolated into the derived DATABASE_URL
    (see locals.tf). Supply from a gitignored terraform.tfvars (or
    TF_VAR_postgres_user) — this workspace uses Local execution mode.
  EOT
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z_][A-Za-z0-9_]*$", var.postgres_user))
    error_message = "postgres_user must be a valid unquoted Postgres identifier (letters, digits, underscore; not starting with a digit). This is a deliberate MVP simplification so DATABASE_URL needs no escaping."
  }
}

variable "postgres_password" {
  description = <<-EOT
    Postgres password. Stored as the POSTGRES_PASSWORD key of
    homestreamlab-app-secrets and interpolated into the derived DATABASE_URL
    (see locals.tf). This workspace uses Local execution mode, so HCP
    Terraform never evaluates workspace variables for it — supply this from a
    gitignored terraform.tfvars (or TF_VAR_postgres_password for a single
    session). Never commit a real value.

    Constrained to URL-safe characters so the derived DATABASE_URL needs no
    escaping — a deliberate MVP simplification. If arbitrary passwords ever
    become a requirement, wrap the interpolation in urlencode() (locals.tf).
  EOT
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^[A-Za-z0-9_-]+$", var.postgres_password))
    error_message = "postgres_password must be non-empty and contain only letters, digits, underscore, or hyphen."
  }
}

variable "backend_image" {
  description = <<-EOT
    Full backend image reference: [registry[:port]/]repository:tag, with an
    explicit tag that is not "latest"
    (e.g. 192.168.1.100:5000/homestreamlab-backend:<git-sha>). Supply from a
    gitignored terraform.tfvars (or TF_VAR_backend_image) — the future
    Jenkins pipeline passes a git-SHA tag here.
  EOT
  type        = string

  validation {
    # Requires ".../<repo>:<tag>". The registry segment may carry a ":port"
    # because the check only inspects the part after the last "/". Rejects a
    # missing tag and an explicit ":latest".
    condition     = can(regex("^[^/]+/.+:[^/:]+$", var.backend_image)) && !endswith(var.backend_image, ":latest")
    error_message = "backend_image must be [registry[:port]/]repository:tag with an explicit tag other than \"latest\"."
  }
}

variable "frontend_image" {
  description = <<-EOT
    Full frontend image reference: [registry[:port]/]repository:tag, with an
    explicit tag that is not "latest"
    (e.g. 192.168.1.100:5000/homestreamlab-frontend:<git-sha>). Supply from a
    gitignored terraform.tfvars (or TF_VAR_frontend_image) — the future
    Jenkins pipeline passes a git-SHA tag here.
  EOT
  type        = string

  validation {
    condition     = can(regex("^[^/]+/.+:[^/:]+$", var.frontend_image)) && !endswith(var.frontend_image, ":latest")
    error_message = "frontend_image must be [registry[:port]/]repository:tag with an explicit tag other than \"latest\"."
  }
}
