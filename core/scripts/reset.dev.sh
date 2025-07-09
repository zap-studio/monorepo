#!/bin/bash

# Reset development environment

set -e

echo "Resetting development environment..."

# Stop and remove containers with volumes
docker-compose down -v

# Remove node_modules for clean install
rm -rf node_modules

# Remove .next for clean build
rm -rf .next

# Remove drizzle generated files
rm -rf drizzle

echo "Cleaned up development environment"
echo ""
echo "Run 'npm run dev:setup' to start fresh" 