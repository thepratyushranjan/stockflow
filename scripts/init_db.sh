#!/bin/bash

# Script to initialize the database and run migrations

echo "🚀 StockFlow Database Initialization"
echo "===================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your database configuration."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📊 Database Configuration:"
echo "  Host: $POSTGRES_SERVER"
echo "  Port: $POSTGRES_PORT"
echo "  Database: $POSTGRES_DB"
echo "  User: $POSTGRES_USER"
echo ""

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
pg_isready -h $POSTGRES_SERVER -p $POSTGRES_PORT -U $POSTGRES_USER > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Error: Cannot connect to PostgreSQL server!"
    echo "Please ensure PostgreSQL is running and credentials are correct."
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Check if database exists, create if not
echo "🔍 Checking if database exists..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_SERVER -p $POSTGRES_PORT -U $POSTGRES_USER -lqt | cut -d \| -f 1 | grep -qw $POSTGRES_DB

if [ $? -ne 0 ]; then
    echo "📝 Creating database: $POSTGRES_DB"
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_SERVER -p $POSTGRES_PORT -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_DB;"
    
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"
    else
        echo "❌ Error: Failed to create database"
        exit 1
    fi
else
    echo "✅ Database already exists"
fi

echo ""

# Run Alembic migrations
echo "🔄 Running database migrations..."
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✅ Migrations applied successfully"
else
    echo "❌ Error: Migration failed"
    exit 1
fi

echo ""
echo "✨ Database initialization complete!"
echo ""
echo "You can now start the application with:"
echo "  uvicorn main:app --reload"
