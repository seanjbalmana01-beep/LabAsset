**`labasset/Jenkinsfile`**
```groovy
pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'labasset'
        TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Test') {
            steps {
                sh 'echo "Running tests..."'
            }
        }

        stage('Build Images') {
            steps { sh 'docker compose build' }
        }

        stage('Deploy') {
            steps {
                withCredentials([file(credentialsId: 'labasset-env', variable: 'ENV_FILE')]) {
                    sh 'cp "$ENV_FILE" .env'
                    sh 'docker compose up -d --no-build --remove-orphans'
                }
            }
        }

        stage('Smoke Test') {
            steps {
                sh 'curl -f http://localhost:8080/ || exit 1'
            }
        }
    }

    post {
        success { echo "Build ${TAG} deployed successfully." }
        failure { echo "Build ${TAG} failed." }
        always  { sh 'rm -f .env' }
    }
}