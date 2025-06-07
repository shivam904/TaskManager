@echo off
title Task Management System

echo 🚀 Starting Task Management System...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Display menu
echo Choose an option:
echo 1) Production mode (http://localhost)
echo 2) Development mode (http://localhost:3000)
echo 3) Stop all services
echo 4) Clean up everything (remove containers, volumes, images)
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo 🏭 Starting in production mode...
    docker-compose up --build
) else if "%choice%"=="2" (
    echo 🛠️  Starting in development mode...
    docker-compose -f docker-compose.dev.yml up --build
) else if "%choice%"=="3" (
    echo 🛑 Stopping all services...
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo ✅ All services stopped.
    pause
) else if "%choice%"=="4" (
    echo 🧹 Cleaning up everything...
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -af
    echo ✅ Cleanup completed.
    pause
) else (
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
) 