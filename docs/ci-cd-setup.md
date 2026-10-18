
# LabAsset CI/CD Setup Guide

## Overview

LabAsset uses GitHub, Jenkins, Docker, and Docker Compose to automate testing and deployment. The Jenkins pipeline checks out the source code, runs tests, builds versioned images, deploys the application, performs smoke tests, and marks verified images as stable.

## Prerequisites

- Git installed
- Docker Engine or Docker Desktop with Docker Compose
- Access to the LabAsset GitHub repository
- A configured Jenkins instance
- The required Jenkins plugins and credentials

## Start the Application

1. Open a terminal in the project root.
2. Configure local environment variables using `.env.example` as a template.
3. Start the application:

   ```bash
   docker compose up --build -d
   ```

4. Check the container status:

   ```bash
   docker compose ps
   ```

5. Open `http://localhost:8080` in a browser.

## Jenkins Configuration

1. Start Jenkins using the separate Compose configuration:

   ```bash
   docker compose -f infra/jenkins/docker-compose.yml up -d --build
   ```

2. Open `http://localhost:8081`.
3. Configure a Pipeline job connected to the LabAsset GitHub repository.
4. Configure the required `labasset-env` Secret file credential.
5. Verify the configured source-control polling trigger.

Never commit real passwords or credential files to Git.

## Pipeline Stages

1. **Checkout:** Retrieves the source code.
2. **Test:** Checks JavaScript syntax and required frontend content.
3. **Build Images:** Builds Docker images tagged with the Jenkins build number.
4. **Deploy:** Starts the application using Docker Compose and the configured environment.
5. **Smoke Test:** Checks the application and important API endpoints.
6. **Mark Stable:** Updates stable image tags after verification succeeds.

A failed test must stop the pipeline before deployment.

## Troubleshooting

- Inspect the Jenkins console output when a stage fails.
- Run `docker compose ps` to inspect container status.
- Run `docker compose logs` to review application logs.
- Confirm required environment variables and Jenkins credentials are configured.
- Verify the latest pipeline result before assuming deployment succeeded.

## Rollback

Use the team's documented rollback procedure to restore a previously verified image version. Confirm that the required image tags exist before attempting rollback, then verify the application and its API endpoints afterward.

Do not remove the database volume during ordinary recovery, because doing so may delete persistent data.

## Security Notes

- Keep `.env` and real credentials out of source control.
- Commit `.env.example` with placeholder values only.
- Restrict access to Jenkins and the Docker daemon.
- Verify pipeline results before declaring a deployment successful.
