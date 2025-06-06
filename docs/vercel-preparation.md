# Vercel Deployment Preparation

This document summarizes the changes made to prepare the Restaurant Project for Vercel deployment.

## 🔧 Configuration Changes

### 1. Prisma Configuration

- Updated Prisma schema to use the standard output directory
- Corrected PrismaClient import in database/src/index.ts
- Added build script to database package

### 2. Package Scripts

- Added db:generate, db:push, and db:seed scripts to root package.json
- Added vercel-build script that ensures Prisma generates before building
- Added vercel-check script to verify deployment readiness

### 3. Vercel Configuration

- Created vercel.json at root with monorepo configuration
- Created app-specific vercel.json files with correct build commands
- Set up proper routing for multi-app deployment
- Added required environment variables to Turbo configuration

### 4. Build Process

- Updated Turborepo config to include database in build pipeline
- Ensured db:generate runs before build tasks
- Added prisma generate to postinstall in database package

## 🚀 Deployment Options

You have two main options for deploying this monorepo:

### Option 1: Single Domain with Path-based Routing

Deploy as a single Vercel project with path-based routing:

- Main app at: yourdomain.com
- Admin app at: yourdomain.com/admin

This is configured in the root vercel.json with rewrites.

### Option 2: Separate Deployments with Custom Domains

Deploy customer and admin apps as separate Vercel projects:

- Customer app: customer.yourdomain.com
- Admin app: admin.yourdomain.com

For this approach, deploy each app directory separately.

## 🔍 Vercel Environment Variables

Don't forget to set these environment variables in your Vercel project settings:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Your deployment URL
- `BCRYPT_COST_FACTOR`: Recommended value is 10

## ✅ Verification

Before deploying, run the verification script:

```bash
pnpm vercel-check
```

This script checks that all required configurations are in place for a successful deployment.

## 📚 Documentation

For detailed deployment instructions, refer to:

- [Vercel Deployment Guide](./vercel-deployment.md)
- [CI/CD Setup Documentation](./ci-cd-setup.md)

## 🐛 Troubleshooting

If you encounter issues with Prisma client generation:

1. Make sure your DATABASE_URL is correct
2. Try running `pnpm db:generate` locally
3. Check Vercel build logs for specific errors
