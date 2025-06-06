# Vercel Deployment Guide

This guide explains how to deploy the Restaurant Project to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [GitHub account](https://github.com/join) with this repository
3. A PostgreSQL database (you can use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres))

## Deployment Steps

### 1. Connect Your GitHub Repository

1. Log in to your Vercel account
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the Restaurant Project repository

### 2. Configure Project Settings

#### Environment Variables

Add the following environment variables in the Vercel project settings:

```
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-secure-secret-key
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app
BCRYPT_COST_FACTOR=10
```

If using authentication providers, also add:

```
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Build & Development Settings

The repository includes Vercel configuration files that should automatically set:

- Build Command: `pnpm db:generate && pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

### 3. Deploy

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. Access your application at the provided Vercel URL

## Multi-app Deployment

This project includes two applications:

1. **Customer App**: The main customer-facing restaurant website
2. **Admin App**: The admin dashboard for restaurant management

### Deploying Both Apps

#### Option 1: Individual Projects

Create two separate Vercel projects, one pointing to `/apps/customer` and another to `/apps/admin`.

#### Option 2: Monorepo Deployment with Subpaths

Deploy as a single project and use path-based routing:

- Main site: `https://your-domain.com/`
- Admin dashboard: `https://your-domain.com/admin`

#### Option 3: Custom Domains

Deploy as separate projects and use custom domains:

- Customer app: `https://restaurant.com`
- Admin app: `https://admin.restaurant.com`

## Troubleshooting

### Build Failures

If your build fails with Prisma-related errors:

1. Check that `DATABASE_URL` is correctly set
2. Ensure the database is accessible from Vercel's build environment
3. Try regenerating the Prisma client with `pnpm db:generate`

### Database Connection Issues

If your application deploys but can't connect to the database:

1. Verify your `DATABASE_URL` is correct
2. Ensure your database allows connections from Vercel's IP addresses
3. Check for network policies or firewall rules blocking connections

## Monitoring & Logs

After deployment:

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to "Deployments" to see deployment history
4. Click on a deployment to view build and runtime logs

For more help, refer to [Vercel's documentation](https://vercel.com/docs).
