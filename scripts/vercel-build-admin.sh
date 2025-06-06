#!/bin/bash
# Vercel build script for admin app
set -e

echo "🚀 Starting Admin App Build"

# Ensure we're in the root directory
cd /vercel/path0

# Install all dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile=false

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd packages/database
npx prisma generate
cd ../..

# Build admin app specifically
echo "👨‍💼 Building admin app..."
cd apps/admin
npm run build

echo "✅ Admin app build completed!"
