# Task Management System

A full-stack web application for managing tasks, with user authentication, file uploads, and real-time updates.

## Features

- User authentication with JWT
- Role-based authorization (admin and regular users)
- CRUD operations for users and tasks
- Task assignment to users
- File uploads (PDF documents) for tasks
- Filtering and sorting tasks
- Real-time updates using WebSockets
- Comprehensive API documentation with Swagger
- Automated testing with Jest

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time updates
- Multer for file uploads
- Jest for testing

### Frontend (to be implemented)
- React
- Redux for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Socket.io-client for real-time updates

## Project Structure

```
task-management-system/
├── client/               # Frontend React application
├── server/               # Backend Node.js application
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── tests/        # Test files
│   │   ├── uploads/      # Uploaded files
│   │   ├── utils/        # Utility functions
│   │   └── server.js     # Main application file
│   ├── Dockerfile        # Docker configuration for server
│   └── package.json      # Dependencies and scripts
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v1.29 or higher)
- Git

### Quick Start with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. Start the application with a single command:
   ```bash
   docker-compose up
   ```

   Or use the convenience scripts:
   - **Linux/Mac**: `./start.sh`
   - **Windows**: `start.bat`

3. The application will be available at:
   - **Frontend**: http://localhost (production)
   - **Backend API**: http://localhost:5000/api
   - **API Documentation**: http://localhost:5000/api-docs
   - **MongoDB**: localhost:27017

4. **Default login credentials**:
   - Email: `admin@taskmanagement.com`
   - Password: `admin123`

### Development Mode

For development with hot reloading:
```bash
docker-compose -f docker-compose.dev.yml up
```

This will start the frontend on http://localhost:3000 with hot reloading enabled.

### Manual Installation (Alternative)

If you prefer not to use Docker:

#### Manual Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd task-management-system
   ```

2. Set up the backend:
   ```
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-management
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   UPLOAD_PATH=./src/uploads
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

5. Set up the frontend (to be implemented):
   ```
   cd ../client
   npm install
   npm start
   ```

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It provides detailed information about all available endpoints, request parameters, and response formats.

## Testing

Run the automated tests using Jest:

```
cd server
npm test
```

## Deployment

The application can be deployed to various cloud platforms:

### Heroku

1. Create a new Heroku app
2. Connect your GitHub repository
3. Set up the necessary environment variables
4. Deploy the application

### AWS

1. Set up an EC2 instance
2. Install Docker and Docker Compose
3. Clone the repository
4. Run `docker-compose up -d`

## License

This project is licensed under the MIT License.

## Acknowledgements

- Express.js - Web framework for Node.js
- MongoDB - NoSQL database
- Mongoose - MongoDB object modeling
- JWT - JSON Web Token for authentication
- Socket.io - Real-time communication
- Jest - Testing framework 