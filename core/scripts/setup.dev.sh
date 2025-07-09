#!/bin/bash

# Development setup script for Zap.ts with Docker Compose

set -e

echo "Setting up Zap.ts development environment..."

# Check if Docker is running (OrbStack is recommended)
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL
echo "Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U zap_ts_user -d zap_ts_db; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo "PostgreSQL is ready!"

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

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    $PACKAGE_MANAGER install
fi

# Generate database schema
echo "Generating database schema..."
$PACKAGE_MANAGER run db:generate

# Push schema to database
echo "Pushing schema to database..."
$PACKAGE_MANAGER run db:push

echo "Development environment is ready!"
echo ""
echo "Access your database:"
echo "   - Direct connection: localhost:5432"
echo "   - pgAdmin: http://localhost:8080 (admin@zap-ts.local / admin123)"
echo ""
echo "Start development server:"
echo "   $PACKAGE_MANAGER run dev"
echo ""
echo "Useful commands:"
echo "   $PACKAGE_MANAGER run docker:up     - Start all services"
echo "   $PACKAGE_MANAGER run docker:down   - Stop all services"
echo "   $PACKAGE_MANAGER run docker:reset  - Reset database (WARNING: deletes all data)"
echo "   $PACKAGE_MANAGER run db:studio     - Open Drizzle Studio"
echo "   $PACKAGE_MANAGER run db:migrate    - Run migrations" 