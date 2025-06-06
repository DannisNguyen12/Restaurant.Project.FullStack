# Vercel Deployment Instructions

## Setup

1. Create a Vercel account if you don't have one
2. Install the Vercel CLI: `npm install -g vercel`
3. Log in to Vercel: `vercel login`

## Configuration Files

This project includes several configuration files for Vercel:

- Root `vercel.json`: Main configuration for the monorepo
- App-specific `vercel.json` files in each app directory
- `.vercelignore`: Excludes unnecessary files from deployment

## Environment Variables

The following environment variables must be set in your Vercel project:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Your app's URL (e.g., https://your-app.vercel.app)
- `BCRYPT_COST_FACTOR`: Optional, defaults to 10

## Deployment Steps

### Initial Deployment

From the root directory:

```bash
vercel
```

Follow the prompts to link to your Vercel project.

### Production Deployment

```bash
vercel --prod
```

### Deploying Specific Apps

To deploy just the customer app:

```bash
cd apps/customer
vercel
```

To deploy just the admin app:

```bash
cd apps/admin
vercel
```

## Troubleshooting

If you encounter the error `Module not found: Can't resolve '../generated/prisma'`:

1. Make sure Prisma client generation happens before build:

   - The root package.json has a `vercel-build` script that handles this
   - The database package has a `postinstall` script that generates the client

2. Check that the database index is importing Prisma correctly:

   - It should use `import { PrismaClient } from '@prisma/client'`

3. Verify environment variables:
   - Make sure `DATABASE_URL` is properly set in Vercel

For more detailed instructions, see [docs/vercel-deployment.md](./docs/vercel-deployment.md).
