#!/usr/bin/env bash

# This script verifies the basic setup of the restaurant project
# - Database connection
# - API functionality
# - Frontend data fetching

echo "🔍 Restaurant Project Verification"
echo "=================================="

# Go to project root
cd /workspaces/Project.Restaurant/Restaurant.Project.FullStack

# Check database
echo -e "\n📊 Checking database..."
cd packages/database
npx tsx src/check-db.ts
if [ $? -ne 0 ]; then
  echo "❌ Database check failed!"
  exit 1
fi

# Check admin API
echo -e "\n🔐 Testing admin API..."
cd ../../apps/admin
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3002/api/items" | grep "200"
if [ $? -ne 0 ]; then
  echo "❌ Admin API test failed!"
else
  echo "✅ Admin API responding correctly"
fi

# Check customer API
echo -e "\n👥 Testing customer API..."
cd ../customer
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/items" | grep "200"
if [ $? -ne 0 ]; then
  echo "❌ Customer API test failed!"
else
  echo "✅ Customer API responding correctly"
fi

echo -e "\n✅ Verification complete!"
exit 0
