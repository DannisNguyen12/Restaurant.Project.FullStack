#!/bin/bash

# Test build script for Vercel deployment
set -e

echo "🚀 Testing build process locally..."

# Clean install
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
pnpm --filter database db:generate

# Test customer app build
echo "🏪 Building customer app..."
cd apps/customer
pnpm build
cd ../..

# Test admin app build  
echo "👨‍💼 Building admin app..."
cd apps/admin
pnpm build
cd ../..

echo "✅ All builds completed successfully!"
