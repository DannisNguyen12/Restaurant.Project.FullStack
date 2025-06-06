#!/bin/bash
set -e

echo "🚀 Starting Admin App Build"

# Change to root directory (Vercel root)
cd /vercel/path0

# Generate Prisma client for database package
echo "🗄️ Generating Prisma client..."
pnpm --filter database exec prisma generate

# Build admin app specifically
echo "👨‍💼 Building admin app..."
cd apps/admin
pnpm run build

echo "✅ Admin app build completed!"