
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
                    node --check asset-api/server.js

                    echo "Checking frontend JavaScript syntax..."
                    node --check frontend/public/js/app.js

                    echo "Checking required frontend elements..."
                    grep -q 'id="asset-list"' frontend/public/index.html

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
                    curl --retry 10 --retry-delay 3 \
                        --retry-connrefused \
                        -f http://localhost:8080/
                    curl --retry 10 --retry-delay 3 \
                        --retry-connrefused \
                        -f http://localhost:8080/api/assets
                '''
            }
        }
    }

    post {
        success {
            echo "Build ${TAG} deployed successfully."
        }
        failure {
            echo "Build ${TAG} failed. Check the stage logs."
        }
        always {
            sh 'rm -f .env'
        }
    }
}
