pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'labasset'
        TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Files') {
            steps {
                sh '''
                    test -f docker-compose.yml
                    test -f .env.example
                    test -f frontend/Dockerfile
                    test -f asset-api/server.js
                    echo "Required project files found."
                '''
            }
        }

        stage('Validate Compose') {
            steps {
                sh 'docker compose config --quiet'
            }
        }

        stage('Build Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Pre-Deploy Smoke Test') {
            steps {
                sh '''
                    docker compose up -d
                    ready=0
                    for i in $(seq 1 30); do
                        if curl -fsS http://host.docker.internal:8080/api/health; then
                            ready=1
                            break
                        fi
                        sleep 2
                    done
                    if [ "$ready" -ne 1 ]; then
                        echo "API health check failed."
                        exit 1
                    fi
                    curl -fsS http://host.docker.internal:8080/api/assets
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose up -d --no-build --remove-orphans'
            }
        }

        stage('Post-Deploy Smoke Test') {
            steps {
                sh '''
                    curl -fsS http://host.docker.internal:8080/
                    curl -fsS http://host.docker.internal:8080/api/health
                    curl -fsS http://host.docker.internal:8080/api/assets
                '''
            }
        }
    }

    post {
        success {
            echo "Build ${TAG} completed successfully."
        }
        failure {
            echo "Build ${TAG} failed."
        }
    }
}
