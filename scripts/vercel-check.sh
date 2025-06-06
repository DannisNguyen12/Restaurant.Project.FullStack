#!/bin/bash

# Vercel Deployment Verification Script
# This script checks if your project is ready for Vercel deployment

echo "🔍 Vercel Deployment Verification"
echo "=================================="

# Check if required files exist
echo "📁 Checking required configuration files..."

CONFIG_FILES=(
  "vercel.json"
  "turbo.json"
  "apps/customer/vercel.json"
  "apps/admin/vercel.json"
  "packages/database/prisma/schema.prisma"
)

for file in "${CONFIG_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file is missing"
  fi
done

# Check database schema configuration
echo -e "\n🔄 Checking Prisma configuration..."
if grep -q "provider = \"prisma-client-js\"" packages/database/prisma/schema.prisma; then
  echo "✅ Prisma client provider is configured"
else
  echo "❌ Prisma client provider is not properly configured"
fi

# Check package.json scripts
echo -e "\n📦 Checking package.json scripts..."
if grep -q "\"db:generate\":" package.json; then
  echo "✅ db:generate script exists in root package.json"
else
  echo "❌ db:generate script is missing in root package.json"
fi

if grep -q "\"build\":" packages/database/package.json; then
  echo "✅ build script exists in database package.json"
else
  echo "❌ build script is missing in database package.json"
fi

# Check database import in index.ts
echo -e "\n🔄 Checking database client import..."
if grep -q "import { PrismaClient } from '@prisma/client'" packages/database/src/index.ts; then
  echo "✅ PrismaClient is imported correctly"
else
  echo "❌ PrismaClient import might be incorrect"
fi

# Check for .env.example
echo -e "\n🔐 Checking environment variables..."
if [ -f ".env.example" ]; then
  echo "✅ .env.example exists"
else
  echo "❌ .env.example is missing"
fi

echo -e "\n🌐 Required environment variables for Vercel:"
ENV_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "BCRYPT_COST_FACTOR"
)

for var in "${ENV_VARS[@]}"; do
  if grep -q "$var" .env.example 2>/dev/null; then
    echo "✅ $var is in .env.example"
  else
    echo "❌ $var is missing from .env.example"
  fi
done

echo -e "\n📋 Final checklist:"
echo "1. Make sure your PostgreSQL database is accessible from Vercel"
echo "2. Set all required environment variables in Vercel project settings"
echo "3. Connect your GitHub repository to Vercel"
echo "4. Deploy both admin and customer apps separately or use the monorepo config"

echo -e "\n🚀 Your project should now be ready for Vercel deployment!"
