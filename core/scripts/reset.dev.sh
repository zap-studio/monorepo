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

# Detect package manager
if [ -f "package-lock.json" ]; then
    PACKAGE_MANAGER="npm"
elif [ -f "yarn.lock" ]; then
    PACKAGE_MANAGER="yarn"
elif [ -f "pnpm-lock.yaml" ]; then
    PACKAGE_MANAGER="pnpm"
else
    PACKAGE_MANAGER="bun"
fi

echo "Cleaned up development environment"
echo ""
echo "Run '$PACKAGE_MANAGER run dev:setup' to start fresh" 