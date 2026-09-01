// HomeStreamLab gated home lab delivery pipeline.
//
// Consumes the shared local-jenkins-platform delivery capabilities (docker,
// docker buildx, terraform, kubectl, homelab-preflight) and the registered
// project credentials (hcp-terraform-cli, k3s-homestreamlab,
// homestreamlab-jwt-secret, homestreamlab-postgres-password). This repository
// owns build + deployment intent only; the Jenkins runtime, credential
// mechanism and homelab substrate are owned elsewhere — see infra/README.md
// and local-jenkins-platform's docs/runbooks/project-onboarding.md.
//
// Flow: checkout/identify revision -> preflight -> release-tag write-once
// precheck -> build -> publish -> terraform init/validate -> plan -> human
// approval gate -> apply the saved plan -> verify the live rollout.
//
// No tracked infra/*.tf or *.tfvars file is written or modified by this
// pipeline. Image references and the operator's kubeconfig path/context reach
// Terraform only through TF_VAR_* environment variables set at plan time and
// frozen into the saved plan (infra/tfplan) that the approved apply consumes.

pipeline {
    agent any

    options {
        // No single global timeout: the human approval gate (up to 30 minutes,
        // see the Deploy stage) must not race a pipeline-wide clock that also
        // has to cover build/publish/terraform work before it and apply/verify
        // after it. Instead every stage and every long-running operation below
        // carries its own bounded timeout, so the pipeline still always fails
        // closed instead of hanging, without the outer timeout being able to
        // expire mid-apply or mid-verification right after a legitimate
        // approval.
        disableConcurrentBuilds()
        // No timestamps() and no cleanWs() — Timestamper and Workspace Cleanup
        // are not part of the confirmed local-jenkins-platform plugin baseline
        // (local-jenkins-platform commit fec7cde removed an unsupported
        // `timestamps` option from the platform verification job). This
        // pipeline must not introduce a new platform plugin dependency, so
        // cleanup below uses Pipeline-native deleteDir() instead.
    }

    environment {
        // <HOST_IP>:5000 — supplied by the local-jenkins-platform container
        // environment (docker-compose.yml). Never hard-code a host IP here.
        REGISTRY         = "${env.HOMELAB_REGISTRY}"
        // Canonical OCI consumer contract: ${REGISTRY}/homestreamlab/<component>:<git-sha>
        IMAGE_REPO       = 'homestreamlab'
        // Same-origin Traefik routing model — see infra/README.md "Ingress".
        FRONTEND_API_URL = 'http://homestreamlab.homelab.home.arpa'
        INFRA_DIR        = 'infra'

        // Consumer-owned NON-SECRET Postgres configuration. Per the
        // local-jenkins-platform consumer application secret contract, these
        // must never become a Jenkins credential, a Docker secret or a
        // platform environment variable — they stay declared here, in this
        // repository. They must stay stable across applies: Postgres only
        // honours POSTGRES_DB / POSTGRES_USER on first data-dir init (see
        // infra/README.md "Secrets").
        TF_VAR_postgres_db   = 'homestreamlab'
        TF_VAR_postgres_user = 'homestreamlab_app'
    }

    stages {
        stage('Checkout & identify revision') {
            options { timeout(time: 5, unit: 'MINUTES') }
            steps {
                // The multibranch job performs the SCM checkout implicitly
                // before the first stage; this stage only identifies the
                // exact revision and computes the immutable image references
                // that every later stage reuses (never recomputed, never
                // re-derived from a mutable ref). No Terraform/Kubernetes
                // mutation happens here.
                script {
                    // Fail closed before constructing any image reference or
                    // running preflight: REGISTRY is derived from the
                    // platform-supplied HOMELAB_REGISTRY container env var
                    // (docker-compose.yml), never hard-coded here, so an unset
                    // or empty value must stop the build immediately rather
                    // than produce a malformed "/homestreamlab/backend:<sha>"
                    // reference downstream.
                    if (!env.REGISTRY?.trim()) {
                        error 'HOMELAB_REGISTRY is unset or empty — cannot construct image references'
                    }

                    env.GIT_SHA = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                    if (!(env.GIT_SHA ==~ /^[0-9a-f]{40}$/)) {
                        error "Unexpected git revision format: '${env.GIT_SHA}' (expected 40 hex chars)"
                    }

                    // Computed once, stored on env: every later stage reads
                    // these back as ordinary shell-expanded environment
                    // variables ($BACKEND_IMAGE / $FRONTEND_IMAGE) inside
                    // single-quoted sh blocks — never re-built via Groovy
                    // string interpolation into a script literal.
                    env.BACKEND_IMAGE  = "${env.REGISTRY}/${env.IMAGE_REPO}/backend:${env.GIT_SHA}"
                    env.FRONTEND_IMAGE = "${env.REGISTRY}/${env.IMAGE_REPO}/frontend:${env.GIT_SHA}"

                    echo "Revision:       ${env.GIT_SHA}"
                    echo "Backend image:  ${env.BACKEND_IMAGE}"
                    echo "Frontend image: ${env.FRONTEND_IMAGE}"
                }
            }
        }

        stage('Preflight (homelab-preflight)') {
            options { timeout(time: 15, unit: 'MINUTES') }
            steps {
                // Non-mutating, bounded. Fails closed (non-zero) before any
                // registry or k3s work if the registry, host Docker
                // registry-trust or the k3s API are not ready. Never
                // reimplement its retry logic.
                sh 'homelab-preflight'
            }
        }

        stage('Release-tag write-once precheck') {
            options { timeout(time: 5, unit: 'MINUTES') }
            steps {
                // The local registry does not enforce atomic tag immutability
                // — a plain `docker push` to an existing tag would overwrite
                // it. Write-once here is pipeline-enforced under the trusted
                // single-writer model (this controller is the sole writer to
                // homestreamlab/*, `main` only branch trust), not a
                // registry-level immutability lock.
                //
                // Existence is probed directly against the Docker Registry
                // HTTP API V2 over the plain-HTTP registry — not via plain
                // `docker manifest inspect`, which does not inherit the
                // daemon's insecure-registry configuration.
                script {
                    env.RELEASE_ACTION = sh(
                        returnStdout: true,
                        script: '''
                            set -eu
                            probe() {
                                curl -sS --max-time 15 -o /dev/null -w '%{http_code}' \
                                    -H 'Accept: application/vnd.oci.image.index.v1+json' \
                                    -H 'Accept: application/vnd.oci.image.manifest.v1+json' \
                                    -H 'Accept: application/vnd.docker.distribution.manifest.list.v2+json' \
                                    -H 'Accept: application/vnd.docker.distribution.manifest.v2+json' \
                                    "http://$REGISTRY/v2/$IMAGE_REPO/$1/manifests/$GIT_SHA"
                            }

                            backend_code=$(probe backend)
                            frontend_code=$(probe frontend)

                            if [ "$backend_code" = "200" ] && [ "$frontend_code" = "200" ]; then
                                echo "REUSE"
                            elif [ "$backend_code" = "404" ] && [ "$frontend_code" = "404" ]; then
                                echo "BUILD"
                            else
                                # Exactly one present, or any non-200/404 response
                                # (including a transport failure caught by set -e
                                # above): partial/inconsistent prior release —
                                # fail closed rather than guess.
                                echo "release-tag precheck failed closed: backend=$backend_code frontend=$frontend_code" >&2
                                exit 1
                            fi
                        '''
                    ).trim()
                    echo "Release-tag precheck: ${env.RELEASE_ACTION}"
                }
            }
        }

        stage('Build images') {
            when { environment name: 'RELEASE_ACTION', value: 'BUILD' }
            options { timeout(time: 20, unit: 'MINUTES') }
            steps {
                sh '''
                    set -eu
                    docker build -f backend/Dockerfile -t "$BACKEND_IMAGE" backend
                    docker build -f frontend/Dockerfile \
                        --build-arg VITE_API_URL="$FRONTEND_API_URL" \
                        -t "$FRONTEND_IMAGE" frontend
                '''
            }
        }

        stage('Publish images') {
            when { environment name: 'RELEASE_ACTION', value: 'BUILD' }
            options { timeout(time: 10, unit: 'MINUTES') }
            steps {
                // Under the write-once precheck above, this only ever
                // *creates* the two <git-sha> tags — it never re-pushes an
                // existing one. This is a deliberate registry write before the
                // human approval gate: it touches no Terraform state and no
                // Kubernetes deployment, so it is outside the scope the gate
                // protects.
                sh '''
                    set -eu
                    docker push "$BACKEND_IMAGE"
                    docker push "$FRONTEND_IMAGE"

                    # Confirm the push and resolve the digest for traceability
                    # only — the deployment identity stays the canonical
                    # Git-SHA tag, never the digest. This check is fail-closed:
                    # a transport failure, a non-200 response, or a 200 with no
                    # Docker-Content-Digest header on an image we just pushed
                    # successfully all abort the build rather than silently
                    # logging an empty value.
                    verify_pushed() {
                        component="$1"
                        headers="$(mktemp)"
                        http_code=$(curl -sS --max-time 15 -D "$headers" -o /dev/null -w '%{http_code}' \
                            -H 'Accept: application/vnd.oci.image.index.v1+json' \
                            -H 'Accept: application/vnd.oci.image.manifest.v1+json' \
                            -H 'Accept: application/vnd.docker.distribution.manifest.list.v2+json' \
                            -H 'Accept: application/vnd.docker.distribution.manifest.v2+json' \
                            "http://$REGISTRY/v2/$IMAGE_REPO/$component/manifests/$GIT_SHA")
                        if [ "$http_code" != "200" ]; then
                            echo "post-push manifest check failed for $component: HTTP $http_code" >&2
                            rm -f "$headers"
                            exit 1
                        fi
                        digest=$(tr -d '\\r' < "$headers" | awk -F': ' 'tolower($1)=="docker-content-digest"{print $2}')
                        rm -f "$headers"
                        if [ -z "$digest" ]; then
                            echo "post-push manifest for $component has no Docker-Content-Digest header" >&2
                            exit 1
                        fi
                        echo "$component digest: $digest"
                    }
                    verify_pushed backend
                    verify_pushed frontend
                '''
            }
        }

        stage('Terraform init & validate') {
            options { timeout(time: 10, unit: 'MINUTES') }
            steps {
                dir(env.INFRA_DIR) {
                    withCredentials([
                        string(credentialsId: 'hcp-terraform-cli', variable: 'TF_TOKEN_app_terraform_io')
                    ]) {
                        // TF_CLOUD_ORGANIZATION is already in the container
                        // environment; the cloud block in versions.tf pins the
                        // workspace name. infra/validate.sh is intentionally
                        // not run here — its `-backend=false` re-init would
                        // discard this real cloud-backend init in the same
                        // directory.
                        sh '''
                            set +x
                            terraform init -input=false
                            terraform validate
                            terraform fmt -check
                        '''
                    }
                }
            }
        }

        stage('Deploy (plan, approve, apply)') {
            steps {
                dir(env.INFRA_DIR) {
                    // The k3s-homestreamlab Secret File binding spans the
                    // entire stage — plan, the human approval wait, and the
                    // saved-plan apply — because providers.tf resolves the
                    // kubeconfig from an input variable (kubeconfig_path)
                    // whose concrete value is frozen into the saved plan. A
                    // second file binding at apply time would materialise the
                    // kubeconfig at a different temp path and break
                    // `terraform apply tfplan`. The HCP token and the two
                    // sensitive application-secret credentials are, by
                    // contrast, bound only around plan creation and released
                    // before the approval wait — nothing needs them while a
                    // human is deciding, and terraform apply of a saved plan
                    // ignores TF_VAR_* for already-planned values anyway.
                    withCredentials([
                        file(credentialsId: 'k3s-homestreamlab', variable: 'KUBECONFIG')
                    ]) {
                        withCredentials([
                            string(credentialsId: 'hcp-terraform-cli', variable: 'TF_TOKEN_app_terraform_io'),
                            string(credentialsId: 'homestreamlab-jwt-secret', variable: 'TF_VAR_jwt_secret'),
                            string(credentialsId: 'homestreamlab-postgres-password', variable: 'TF_VAR_postgres_password')
                        ]) {
                            // Bounded on its own — independent of the approval
                            // wait below, so this cannot be starved by, or
                            // itself starve, the 30-minute input timeout.
                            timeout(time: 10, unit: 'MINUTES') {
                                sh '''
                                    set -eu
                                    set +x
                                    export TF_VAR_kubeconfig_path="$KUBECONFIG"
                                    # Resolved once, here, from the bound
                                    # kubeconfig and frozen into the saved plan
                                    # alongside kubeconfig_path — never
                                    # deferred to a failed first apply. Kept as
                                    # a separate assignment (not inlined into
                                    # export) so a kubectl failure stays
                                    # visible to `set -e`, plus an explicit
                                    # empty check so a successful-but-empty
                                    # result also fails closed before
                                    # `terraform plan` ever runs.
                                    kube_context="$(kubectl --kubeconfig "$KUBECONFIG" --request-timeout=15s config current-context)"
                                    if [ -z "$kube_context" ]; then
                                        echo "kubectl config current-context returned empty — refusing to plan" >&2
                                        exit 1
                                    fi
                                    export TF_VAR_kube_context="$kube_context"
                                    export TF_VAR_backend_image="$BACKEND_IMAGE"
                                    export TF_VAR_frontend_image="$FRONTEND_IMAGE"
                                    # tfplan embeds jwt_secret, postgres_password
                                    # and the kubeconfig path — restrict its
                                    # permissions from the moment it is
                                    # created, on top of the explicit chmod
                                    # below (defense in depth: umask alone
                                    # would not protect a plan file terraform
                                    # opens with a wider mode).
                                    umask 077
                                    terraform plan -input=false -lock-timeout=120s -out=tfplan
                                    chmod 600 tfplan
                                '''
                            }
                        }

                        // Pre-approval evidence that no Terraform/Kubernetes
                        // deployment mutation has occurred yet. homestreamlab-k8s
                        // is an HCP Local-execution workspace, so there is no
                        // HCP run queue to inspect instead. A redeploy of an
                        // already-live commit is a legitimate Terraform no-op —
                        // this baseline is not required to differ from the
                        // post-apply state, only to show apply has not run.
                        timeout(time: 2, unit: 'MINUTES') {
                            sh '''
                                set +x
                                echo "Pre-approval baseline (must be unchanged by this build until apply runs):"
                                kubectl --kubeconfig "$KUBECONFIG" --request-timeout=15s -n homestreamlab get deployment/homestreamlab-backend \
                                    -o jsonpath='{.spec.template.spec.containers[*].image} gen={.metadata.generation}' 2>/dev/null \
                                    || echo "homestreamlab-backend: absent"
                                echo
                                kubectl --kubeconfig "$KUBECONFIG" --request-timeout=15s -n homestreamlab get deployment/homestreamlab-frontend \
                                    -o jsonpath='{.spec.template.spec.containers[*].image} gen={.metadata.generation}' 2>/dev/null \
                                    || echo "homestreamlab-frontend: absent"
                                echo
                            '''
                        }

                        // This 30-minute window is the only unbounded-feeling
                        // wait in the pipeline, and it is deliberately not
                        // nested inside — or added to — any other timeout:
                        // there is no pipeline-wide timeout left to race, and
                        // the operation-scoped timeouts before/after this step
                        // do not include the approval wait.
                        timeout(time: 30, unit: 'MINUTES') {
                            input message: "Apply HomeStreamLab ${env.GIT_SHA}? backend=${env.BACKEND_IMAGE} frontend=${env.FRONTEND_IMAGE}",
                                  ok: 'Apply'
                        }

                        // Apply the SAVED plan only. No TF_VAR_* is re-supplied
                        // for planned values (terraform apply tfplan ignores
                        // -var / TF_VAR_* for them) — only the HCP token is
                        // re-bound, since it is needed to write state/locking.
                        // Bounded independently of both the approval wait
                        // before it and the verification stage after it.
                        withCredentials([
                            string(credentialsId: 'hcp-terraform-cli', variable: 'TF_TOKEN_app_terraform_io')
                        ]) {
                            timeout(time: 15, unit: 'MINUTES') {
                                sh '''
                                    set -eu
                                    set +x
                                    terraform apply -input=false -lock-timeout=120s tfplan
                                '''
                            }
                        }
                    }
                }
            }
        }

        stage('Verify deployment') {
            // No dir(env.INFRA_DIR) here — this stage runs kubectl only, no
            // terraform command and no relative path into infra/, so changing
            // the working directory has no functional purpose.
            options { timeout(time: 15, unit: 'MINUTES') }
            steps {
                // The homestreamlab-deployer RBAC identity has no workload
                // list/watch and no update — kubectl rollout status and
                // kubectl get deployments (plural) are not permitted.
                // Verification therefore polls single-resource `get` by
                // name in a bounded loop and asserts the desired end
                // state, not that anything necessarily changed (a rerun of
                // an already-deployed commit is a valid Terraform no-op).
                // Every kubectl call carries --request-timeout=15s so a single
                // slow/hung API call cannot defeat the deadline below.
                withCredentials([
                    file(credentialsId: 'k3s-homestreamlab', variable: 'KUBECONFIG')
                ]) {
                    sh '''
                        set -eu
                        set +x
                        deadline=$(( $(date +%s) + 600 ))

                        wait_ready() {
                            dep="$1"
                            while :; do
                                out=$(kubectl --kubeconfig "$KUBECONFIG" --request-timeout=15s -n homestreamlab get "deployment/$dep" \
                                    -o jsonpath='{.spec.replicas}/{.status.readyReplicas}/{.status.observedGeneration}/{.metadata.generation}' \
                                    2>/dev/null || echo "")
                                spec_replicas=$(echo "$out"  | cut -d/ -f1)
                                ready_replicas=$(echo "$out" | cut -d/ -f2)
                                observed_gen=$(echo "$out"   | cut -d/ -f3)
                                gen=$(echo "$out"            | cut -d/ -f4)

                                if [ -n "$out" ] && [ -n "$ready_replicas" ] \
                                    && [ "$spec_replicas" = "$ready_replicas" ] \
                                    && [ "$observed_gen" = "$gen" ]; then
                                    echo "$dep: Ready ($ready_replicas/$spec_replicas)"
                                    return 0
                                fi
                                if [ "$(date +%s)" -ge "$deadline" ]; then
                                    echo "$dep: not Ready within the bounded wait" >&2
                                    return 1
                                fi
                                sleep 5
                            done
                        }

                        wait_ready homestreamlab-postgres
                        wait_ready homestreamlab-backend
                        wait_ready homestreamlab-frontend

                        live_backend=$(kubectl --kubeconfig "$KUBECONFIG" --request-timeout=15s -n homestreamlab get deployment/homestreamlab-backend \
                            -o jsonpath='{.spec.template.spec.containers[*].image}')
                        live_frontend=$(kubectl --kubeconfig "$KUBECONFIG" --request-timeout=15s -n homestreamlab get deployment/homestreamlab-frontend \
                            -o jsonpath='{.spec.template.spec.containers[*].image}')

                        if [ "$live_backend" != "$BACKEND_IMAGE" ]; then
                            echo "backend image mismatch: live=$live_backend expected=$BACKEND_IMAGE" >&2
                            exit 1
                        fi
                        if [ "$live_frontend" != "$FRONTEND_IMAGE" ]; then
                            echo "frontend image mismatch: live=$live_frontend expected=$FRONTEND_IMAGE" >&2
                            exit 1
                        fi

                        echo "Deployment verified: backend=$BACKEND_IMAGE frontend=$FRONTEND_IMAGE"
                    '''
                }
            }
        }
    }

    post {
        always {
            // tfplan is sensitive (embeds jwt_secret, postgres_password, the
            // kubeconfig path) — delete it explicitly, never stash/archive it.
            sh 'rm -f "$INFRA_DIR/tfplan" || true'
            deleteDir()
        }
    }
}
