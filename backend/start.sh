#!/bin/sh

# Wait for DB to be ready (handled by docker-compose healthcheck mostly, but for safety)
echo "Waiting for database to be ready..."

# Apply committed production migrations
echo "Applying database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting backend server..."
node dist/index.js
