pipeline {
    agent any

    triggers {
        // Check GitHub for changes every minute.
        pollSCM('H/1 * * * *')
    }

    environment {
        COMPOSE_PROJECT_NAME = 'labasset'
        TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test') {
            steps {
                sh '''
                    set -eu

                    echo "Checking API JavaScript syntax..."
                    docker run --rm -i node:22-alpine sh -c \
                        'cat > /tmp/check.js && node --check /tmp/check.js' \
                        < asset-api/server.js

                    echo "Checking frontend JavaScript syntax..."
                    docker run --rm -i node:22-alpine sh -c \
                        'cat > /tmp/check.js && node --check /tmp/check.js' \
                        < frontend/public/js/app.js

                    echo "Checking Request Service JavaScript syntax..."
                    docker run --rm -i node:22-alpine sh -c \
                        'cat > /tmp/check.js && node --check /tmp/check.js' \
                        < request-service/server.js

                    echo "Checking required frontend elements..."
                    grep -Fq '<h1 class="text-lg font-bold tracking-wide text-indigo-200">LabAsset Portal</h1>' frontend/public/index.html

                    echo "Frontend element check passed."
                    echo "All tests passed."
                '''
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    set -eu

                    sed -i "s/BUILD_NUMBER_PLACEHOLDER/${TAG}/g" \
                        frontend/public/index.html

                    docker compose build
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    file(
                        credentialsId: 'labasset-env',
                        variable: 'ENV_FILE'
                    )
                ]) {
                    sh '''
                        set -eu

                        cp "$ENV_FILE" .env
                        docker compose up -d --no-build --remove-orphans
                    '''
                }
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    set -eu

                    echo "Testing LabAsset frontend..."
                    curl --retry 10 --retry-delay 3 --retry-connrefused \
                        -f http://host.docker.internal:8080/

                    echo "Testing LabAsset API..."
                    curl --retry 10 --retry-delay 3 --retry-connrefused \
                        -f http://host.docker.internal:8080/api/assets

                    echo "Testing Request Service..."
                    curl --retry 10 --retry-delay 3 --retry-connrefused \
                        -f http://host.docker.internal:8080/api/requests

                    echo "Smoke tests passed."
                '''
            }
        }

        stage('Mark Stable') {
            steps {
                sh '''
                    set -eu

                    echo "Verifying built images before updating stable tags..."

                    for service in proxy frontend asset-api request-service; do
                        docker image inspect "labasset/${service}:${TAG}" >/dev/null
                    done

                    for service in proxy frontend asset-api request-service; do
                        docker tag \
                            "labasset/${service}:${TAG}" \
                            "labasset/${service}:stable"
                    done

                    echo "Stable image tags updated to verified build ${TAG}."
                '''
            }
        }
    }

    post {
        success {
            echo "Build ${TAG} deployed successfully."
        }

        failure {
            echo "Build ${TAG} failed. Attempting rollback to stable images."

            withCredentials([
                file(
                    credentialsId: 'labasset-env',
                    variable: 'ENV_FILE'
                )
            ]) {
                sh '''
                    set -eu

                    cp "$ENV_FILE" .env

                    for service in proxy frontend asset-api request-service; do
                        if ! docker image inspect "labasset/${service}:stable" >/dev/null 2>&1; then
                            echo "No complete stable image set is available."
                            echo "Automatic rollback cannot proceed."
                            exit 1
                        fi
                    done

                    echo "Redeploying the last verified stable images..."
                    TAG=stable docker compose up -d --no-build --remove-orphans

                    echo "Checking rollback health..."
                    curl --retry 10 --retry-delay 3 --retry-connrefused \
                        -f http://host.docker.internal:8080/

                    curl --retry 10 --retry-delay 3 --retry-connrefused \
                        -f http://host.docker.internal:8080/api/assets

                    curl --retry 10 --retry-delay 3 --retry-connrefused \
                        -f http://host.docker.internal:8080/api/requests

                    echo "Rollback smoke tests passed."
                '''
            }
        }

        always {
            sh 'rm -f .env'
        }
    }
}
