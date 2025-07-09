#!/bin/bash

# Development setup script for Zap.ts with Docker Compose

set -e

echo "Setting up Zap.ts development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# Development Database URL for Docker Compose
DATABASE_URL=postgresql://zap_ts_user:zap_ts_password@localhost:5432/zap_ts_db?sslmode=disable

# Other environment variables (you'll need to add your actual values)
ENCRYPTION_KEY=your-encryption-key-here
VAPID_PRIVATE_KEY=your-vapid-private-key-here
RESEND_API_KEY=your-resend-api-key-here
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
EOF
    echo "Please update .env.local with your actual API keys and secrets"
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

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Generate database schema
echo "Generating database schema..."
npm run db:generate

# Push schema to database
echo "Pushing schema to database..."
npm run db:push

echo "Development environment is ready!"
echo ""
echo "Access your database:"
echo "   - Direct connection: localhost:5432"
echo "   - pgAdmin: http://localhost:8080 (admin@zap-ts.local / admin123)"
echo ""
echo "Start development server:"
echo "   npm run dev"
echo ""
echo "Useful commands:"
echo "   npm run docker:up     - Start all services"
echo "   npm run docker:down   - Stop all services"
echo "   npm run docker:reset  - Reset database (WARNING: deletes all data)"
echo "   npm run db:studio     - Open Drizzle Studio"
echo "   npm run db:migrate    - Run migrations" 