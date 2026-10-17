
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

            echo "Checking project file locations..."
            pwd
            find . -maxdepth 5 -type f \
                \\( -name 'server.js' -o -name 'app.js' -o -name 'index.html' \\) \
                -not -path './.git/*'

            API_FILE=$(find . -type f \
                -path '*/asset-api/server.js' \
                -not -path './.git/*' -print -quit)

            JS_FILE=$(find . -type f \
                -path '*/frontend/public/js/app.js' \
                -not -path './.git/*' -print -quit)

            HTML_FILE=$(find . -type f \
                -path '*/frontend/public/index.html' \
                -not -path './.git/*' -print -quit)

            if [ -z "$API_FILE" ] || \
               [ -z "$JS_FILE" ] || \
               [ -z "$HTML_FILE" ]; then
                echo "ERROR: Required project files were not found."
                exit 1
            fi

            echo "Checking API JavaScript syntax..."
            docker run --rm \
                -v "$PWD:/workspace" \
                -w /workspace \
                node:22-alpine \
                node --check "$API_FILE"

            echo "Checking frontend JavaScript syntax..."
            docker run --rm \
                -v "$PWD:/workspace" \
                -w /workspace \
                node:22-alpine \
                node --check "$JS_FILE"

            echo "Checking required frontend elements..."
            grep -q 'id="asset-list"' "$HTML_FILE"

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
