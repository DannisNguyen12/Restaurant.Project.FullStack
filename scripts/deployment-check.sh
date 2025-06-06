#!/bin/bash
# Deployment readiness check
set -e

echo "🔍 Checking deployment readiness..."

# Check if all required files exist
echo "📁 Checking required files..."
required_files=(
    "package.json"
    "pnpm-lock.yaml" 
    "turbo.json"
    "apps/customer/package.json"
    "apps/admin/package.json"
    "packages/database/package.json"
    "packages/database/prisma/schema.prisma"
)

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Missing required file: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# Check environment variables
echo "🔐 Checking environment setup..."
if [[ ! -f ".env.example" ]]; then
    echo "⚠️  No .env.example found"
else
    echo "✅ Environment example found"
fi

# Test Prisma generation
echo "🗄️ Testing Prisma client generation..."
cd packages/database
if npx prisma generate; then
    echo "✅ Prisma generation successful"
else
    echo "❌ Prisma generation failed"
    exit 1
fi
cd ../..

# Test builds locally (optional, commented out for speed)
# echo "🏗️ Testing local builds..."
# pnpm build

echo "🎉 Deployment readiness check passed!"
echo ""
echo "📋 Next steps for Vercel deployment:"
echo "1. Commit and push all changes"
echo "2. Set environment variables in Vercel dashboard:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET" 
echo "   - NEXTAUTH_URL"
echo "3. Deploy from Vercel dashboard"
