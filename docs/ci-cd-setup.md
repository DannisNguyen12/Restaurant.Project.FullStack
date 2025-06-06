# CI/CD Setup Documentation

## Overview

This document outlines the CI/CD infrastructure set up for the Restaurant Project FullStack.

## Components Set Up

### 1. GitHub Actions Workflows

- **Main CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

  - Triggered on push to main/master/dev branches and PRs
  - Handles installation, linting, building, testing, and deployment
  - Uses caching to speed up the process

- **Release Workflow** (`.github/workflows/release.yml`)
  - Triggered on push to main/master
  - Manages versioning and release notes using changesets
  - Creates GitHub releases automatically

### 2. Git Hooks (using Husky)

- **Pre-commit hooks** for code quality
  - Runs ESLint and Prettier on staged files
  - Prevents committing code that doesn't meet quality standards

### 3. Testing Infrastructure

- **E2E Tests** with Playwright
  - Tests both customer and admin applications
  - Integrated into CI pipeline

### 4. Release Management

- **Changesets** for versioning and changelog generation
  - Tracks changes across packages
  - Automates release notes

### 5. Documentation

- **CONTRIBUTING.md** - Guide for contributors
- **PR Template** - Standardized pull request format
- **Issue Templates** - Bug reports and feature requests
- **CODEOWNERS** - Code ownership and review requirements

## Required Secrets

To make the CI/CD pipeline work, set up these GitHub secrets:

- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth
- `NEXTAUTH_URL` - URL for NextAuth
- `NPM_TOKEN` (if publishing to npm)

## Best Practices

1. Always create feature branches from `dev`
2. Follow conventional commits format
3. Include tests with all new features
4. Request reviews from appropriate code owners
5. Ensure CI checks pass before merging

## Local Development

The same tools used in CI are available locally:

```bash
# Check code quality
pnpm lint

# Run tests
pnpm --filter test test

# Create a changeset for a new version
pnpm exec changeset
```
