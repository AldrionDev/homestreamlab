# HCP Terraform is used for remote state only. Execution mode is Local
# (homelab-platform ADR-0001) — that is workspace-side configuration and
# cannot be expressed here; it must be set in the HCP Terraform UI. See
# README.md for the manual prerequisite.
#
# The organization is account-specific and is supplied through the
# TF_CLOUD_ORGANIZATION environment variable. It is deliberately absent from
# this file and must never be committed.
terraform {
  required_version = "~> 1.15"

  cloud {
    workspaces {
      # homelab-platform ADR-0002: project workspaces are named `<project>-k8s`.
      name = "homestreamlab-k8s"
    }
  }

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 3.2"
    }
  }
}
