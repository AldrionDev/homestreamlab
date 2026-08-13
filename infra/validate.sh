#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"

terraform fmt -check
terraform init -backend=false
terraform validate
