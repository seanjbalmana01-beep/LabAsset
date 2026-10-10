# LabAsset - Containerized Infrastructure and CI/CD Automation

## Overview
LabAsset is a multi-module laboratory resource tracking system containerized with Docker and automated using a Jenkins CI/CD declarative pipeline.

## Architecture
- **Proxy**: Nginx routing `/` to the frontend and `/api/` to the backend.
- **Frontend**: Static web client displaying inventory status.
- **Asset API**: Node.js/Express service handling CRUD operations with database integration.
- **Database**: MySQL 8.4 storing persistent records via named volumes.

## Prerequisites
- Docker & Docker Compose installed.
- Jenkins container running separately (see `infra/jenkins/`).

## How to Run Locally
1. Copy `.env.example` to `.env` and fill in credentials:
   ```bash
   cp .env.example .env