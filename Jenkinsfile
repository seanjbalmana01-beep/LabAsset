
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
            grep -q 'LabAsset Portal' frontend/public/index.html

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
