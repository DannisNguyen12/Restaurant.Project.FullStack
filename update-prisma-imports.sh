#!/bin/bash

# This script updates all API files to use the shared Prisma client

# Find all TypeScript files in the api directories
api_files=$(find /workspaces/Project.Restaurant/Restaurant.Project.FullStack/apps -path "*/app/api/**/route.ts")

# Loop through each file and replace the Prisma client import
for file in $api_files; do
  echo "Processing $file"
  
  # Replace import and instance creation with shared client
  sed -i 's/import { PrismaClient } from "@repo\/database\/generated\/prisma";/import { prisma } from "@repo\/database";/g' "$file"
  sed -i '/const prisma = new PrismaClient();/d' "$file"
  
  echo "Updated $file"
done

echo "All API files updated to use shared Prisma client"
