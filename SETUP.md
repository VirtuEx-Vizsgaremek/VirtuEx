# Setup Guide

This guide will help you set up the VirtuEx project for local development.

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup with Docker](#setup-with-docker)
- [Setup without Docker](#setup-without-docker)
  - [1. API (Backend)](#1-api-backend)
  - [2. Web (Frontend)](#2-web-frontend)
  - [3. Desktop (Admin Application)](#3-desktop-admin-application)
- [Running the Project](#running-the-project)
- [Troubleshooting](#troubleshooting)

## Project Structure

| Path            | Description                        |
| --------------- | ---------------------------------- |
| `/apps/api`     | Backend API (Express + TypeScript) |
| `/apps/web`     | Frontend Web App (Next.js)         |
| `/apps/desktop` | Desktop Admin App (C# / .NET)      |
| `/packages`     | Shared packages and configurations |

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** >= 25.0.0
- **pnpm** 10.25.0 or later
- **PostgreSQL** (for the database)

### Optional

- **Docker** & **Docker Compose** (for containerized setup)
- **.NET SDK** 8.0 or later (for the Desktop application)
- **Visual Studio 2022** or **Rider** (for Desktop app development)

### Verify Installation

```bash
node --version    # Should be >= 25.0.0
pnpm --version    # Should be >= 10.25.0
```

## Setup with Docker

> **Note:** This is the easiest way to get started.

### 1. Configure Environment Variables

Create a `.env` file in the root folder of the project:

```bash
cp .env.example .env
```

Edit the `.env` file and fill in the required values.

### 2. Start the Containers

```bash
docker compose up -d
```

Wait for all images to pull and build. The services will be available at their configured ports.

### 3. Stop the Containers

```bash
docker compose down
```

## Setup without Docker

This method requires manual setup of each component.

### 1. API (Backend)

#### Install Dependencies

From the root directory of the project, install all dependencies:

```bash
pnpm install
```

#### Configure Environment Variables

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and configure the following:

- Database connection (PostgreSQL)
- JWT secrets
- Email service credentials (Nodemailer)
- AWS S3 credentials (for file storage)
- Stripe API keys (for payments)

#### Set Up the Database

Ensure PostgreSQL is running, then create the database schema:

```bash
# Preview the SQL that will be executed
pnpm --filter @virutex/api db:create:dump

# Or update an existing schema
pnpm --filter @virutex/api db:update:dump
```

#### Start the API Server

```bash
pnpm --filter @virutex/api dev
```

### 2. Web (Frontend)

#### Configure Environment Variables

```bash
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env` and configure:

- API endpoint URL
- Any public keys needed for client-side features

#### Start the Development Server

```bash
pnpm --filter @virutex/web dev
```

The web app will be available at `http://localhost:3000` (default Next.js port).

### 3. Desktop (Admin Application)

The desktop application is a C# Windows application for administrative tasks.

#### Open the Solution

1. Navigate to `apps/desktop/`
2. Open `desktop.sln` in Visual Studio 2022 or JetBrains Rider

#### Build and Run

1. Restore NuGet packages
2. Set `VirtuExAdmin` as the startup project
3. Build and run the solution (F5 in Visual Studio)

## Running the Project

### Development Mode (All Services)

From the root directory, you can run all Node.js services simultaneously:

```bash
pnpm dev
```

This uses Turborepo to run the `dev` script in all packages.

### Building for Production

```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

### Type Checking

```bash
pnpm check-types
```

### Code Formatting

```bash
pnpm format
```

## Troubleshooting

### Common Issues

#### `pnpm install` fails

Make sure you're using the correct pnpm version (10.25.0+). You can use corepack to manage this:

```bash
corepack enable
corepack prepare pnpm@10.25.0 --activate
```

#### Database connection errors

1. Verify PostgreSQL is running
2. Check that your database credentials in `.env` are correct
3. Ensure the database exists and the user has proper permissions

#### Port already in use

If a port is already in use, you can either:

- Stop the conflicting service
- Change the port in the respective `.env` file

#### Node.js version mismatch

This project requires Node.js 25 or later. Use a version manager like `nvm` or `fnm`:

```bash
nvm install 25
nvm use 25
```

### Getting Help

If you encounter issues not covered here, please:

1. Check the existing issues in the repository
2. Create a new issue with detailed information about your problem
