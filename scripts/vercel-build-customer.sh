#!/bin/bash
# Vercel build script for customer app
set -e

echo "🚀 Starting Customer App Build"

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

# Build customer app specifically
echo "🏪 Building customer app..."
cd apps/customer
npm run build

echo "✅ Customer app build completed!"
