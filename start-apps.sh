#!/usr/bin/env bash

# This script starts both the admin and customer apps in development mode
# Run with ./start-apps.sh

# Set terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Restaurant Project Apps${NC}"
echo "=================================="

# Navigate to project root
cd /workspaces/Project.Restaurant/Restaurant.Project.FullStack

# Start admin app in the background
echo -e "${CYAN}Starting Admin App on port 3002...${NC}"
cd apps/admin
npm run dev &
ADMIN_PID=$!

# Wait a bit for the first app to initialize
sleep 3

# Start customer app in the background
echo -e "${CYAN}Starting Customer App on port 3001...${NC}"
cd ../customer
npm run dev &
CUSTOMER_PID=$!

echo -e "${GREEN}Both apps are running!${NC}"
echo -e "Admin app: http://localhost:3002"
echo -e "Customer app: http://localhost:3001"
echo -e "${BLUE}Press Ctrl+C to stop both apps${NC}"

# Wait for Ctrl+C and then kill both processes
trap "kill $ADMIN_PID $CUSTOMER_PID; exit" INT
wait
