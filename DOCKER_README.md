# Task Management System - Docker Setup

This guide explains how to run the Task Management System using Docker containers.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 1.29 or higher)
- Git

## Quick Start

### Production Setup

Run the entire application stack with a single command:

```bash
docker-compose up
```

This will start:
- MongoDB database on port 27017
- Node.js backend server on port 5000
- React frontend client on port 80

The application will be available at: http://localhost

### Development Setup

For development with hot reloading:

```bash
docker-compose -f docker-compose.dev.yml up
```

This will start:
- MongoDB database on port 27017
- Node.js backend server on port 5000 (with nodemon for auto-restart)
- React frontend client on port 3000 (with hot reloading)

The application will be available at: http://localhost:3000

## Configuration

### Environment Variables

The following environment variables can be customized:

#### Server Configuration
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration time (default: 30d)
- `UPLOAD_PATH`: File upload directory path

#### Client Configuration
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_SOCKET_URL`: Socket.IO server URL

### Database Configuration

Default MongoDB credentials:
- Username: `admin`
- Password: `password123`
- Database: `taskmanagement`

**⚠️ Important: Change these credentials in production!**

## Default Login Credentials

A default admin user is created automatically:
- Email: `admin@taskmanagement.com`
- Password: `admin123`

**⚠️ Important: Change these credentials immediately after first login!**

## Docker Commands

### Start Services
```bash
# Production
docker-compose up

# Development
docker-compose -f docker-compose.dev.yml up

# Run in background (detached mode)
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs server
docker-compose logs client
docker-compose logs mongodb
```

### Rebuild Services
```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build server
docker-compose build client

# Rebuild and start
docker-compose up --build
```

### Remove Everything (including volumes)
```bash
docker-compose down -v
docker system prune -a
```

## Service Details

### MongoDB Service
- **Image**: mongo:6.0
- **Port**: 27017
- **Volume**: Persistent data storage
- **Initialization**: Runs init-mongo.js to set up database and admin user

### Server Service (Node.js)
- **Build**: Custom Dockerfile in `/server` directory
- **Port**: 5000
- **Features**: 
  - RESTful API
  - JWT authentication
  - File upload support
  - Socket.IO for real-time updates
  - Health check endpoint (`/api/health`)
  - API documentation at `/api-docs`

### Client Service (React)
- **Build**: Multi-stage Dockerfile with Nginx
- **Port**: 80 (production) / 3000 (development)
- **Features**:
  - Production-optimized build
  - Nginx reverse proxy for API requests
  - Gzip compression
  - Hot reloading in development mode

## File Structure

```
task-management-system/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── server/
│   ├── Dockerfile              # Server container configuration
│   ├── .dockerignore          # Files to exclude from build
│   ├── init-mongo.js          # MongoDB initialization script
│   └── ...                    # Server source code
├── client/
│   ├── Dockerfile             # Client container configuration
│   ├── .dockerignore         # Files to exclude from build
│   ├── nginx.conf            # Nginx configuration
│   └── ...                   # Client source code
└── README.md
```

## Ports

| Service  | Development | Production |
|----------|-------------|------------|
| Client   | 3000        | 80         |
| Server   | 5000        | 5000       |
| MongoDB  | 27017       | 27017      |

## Volumes

- `mongodb_data`: Persistent MongoDB data
- `uploads_data`: Uploaded files storage

## Networks

All services communicate through a custom Docker network for security and isolation.

## Health Checks

The server includes health check endpoints:
- Health Check: `GET /api/health`
- API Documentation: `GET /api-docs`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 80, 3000, 5000, and 27017 are not in use
2. **Build failures**: Try `docker-compose build --no-cache`
3. **Database connection issues**: Wait for MongoDB to fully start before accessing the app
4. **File permission issues**: On Linux/Mac, you might need to run with `sudo`

### Logs and Debugging

```bash
# Check service status
docker-compose ps

# View detailed logs
docker-compose logs -f server

# Access container shell
docker-compose exec server sh
docker-compose exec client sh
docker-compose exec mongodb mongosh
```

### Reset Everything

To completely reset the application:

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Production Considerations

1. **Security**: Change default passwords and JWT secrets
2. **Environment Variables**: Use proper environment files for sensitive data
3. **SSL/TLS**: Add HTTPS configuration with certificates
4. **Monitoring**: Implement proper logging and monitoring
5. **Backups**: Set up regular database backups
6. **Scaling**: Consider using Docker Swarm or Kubernetes for scaling

## Development Workflow

1. Make code changes in your local files
2. Changes are automatically reflected in the running containers (development mode)
3. For production testing, rebuild with `docker-compose up --build`

## Support

For issues and questions, please refer to the main project documentation or create an issue in the project repository. 