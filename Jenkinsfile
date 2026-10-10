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

        stage('Build and Deploy') {
            steps {
                withCredentials([file(
                    credentialsId: 'labasset-env',
                    variable: 'ENV_FILE'
                )]) {
                    sh '''
                        set +x
                        cp "$ENV_FILE" .env
                        trap 'rm -f .env' EXIT

                        echo "Validating Docker Compose configuration..."
                        docker compose config --quiet

                        echo "Building application images..."
                        docker compose build

                        echo "Starting application for pre-deploy checks..."
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

                        echo "Deploying application..."
                        docker compose up -d --no-build --remove-orphans

                        echo "Running post-deploy checks..."
                        curl -fsS http://host.docker.internal:8080/
                        curl -fsS http://host.docker.internal:8080/api/health
                        curl -fsS http://host.docker.internal:8080/api/assets

                        echo "All deployment checks passed."
                    '''
                }
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