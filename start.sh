#!/bin/bash

# Task Management System Startup Script

echo "🚀 Starting Task Management System..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Display menu
echo "Choose an option:"
echo "1) Production mode (http://localhost)"
echo "2) Development mode (http://localhost:3000)"
echo "3) Stop all services"
echo "4) Clean up everything (remove containers, volumes, images)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🏭 Starting in production mode..."
        docker-compose up --build
        ;;
    2)
        echo "🛠️  Starting in development mode..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    3)
        echo "🛑 Stopping all services..."
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        echo "✅ All services stopped."
        ;;
    4)
        echo "🧹 Cleaning up everything..."
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -af
        echo "✅ Cleanup completed."
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac 