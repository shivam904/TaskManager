# 🚀 Task Management System

<div align="center">

![Task Management System](https://img.shields.io/badge/Task%20Management-System-blue?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-Included-brightgreen?style=for-the-badge)

**A full-stack web application for comprehensive task management with user authentication, real-time updates, and administrative controls.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-api-documentation) • [Deployment](#-deployment) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Installation Methods](#-installation-methods)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Docker Configuration](#-docker-configuration)
- [Development Guidelines](#-development-guidelines)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with secure token management
- **Role-based Access Control** (Admin/User roles)
- **Password Hashing** with bcrypt
- **Protected Routes** with middleware validation
- **User Profile Management** with editable profiles

### 📝 Task Management
- **Complete CRUD Operations** for tasks
- **Task Assignment** to specific users
- **Priority Levels** (High, Medium, Low)
- **Task Status Tracking** (Pending, In Progress, Completed)
- **Due Date Management** with deadline tracking
- **Advanced Filtering & Sorting** capabilities
- **Pagination** for large datasets

### 📁 File Management
- **File Upload Support** (PDF, images, documents)
- **File Size Validation** and type restrictions
- **Secure File Storage** with organized directory structure
- **File Download** functionality

### 👥 User Management (Admin Features)
- **User CRUD Operations** with admin controls
- **Role Assignment** and permission management
- **User Search & Filtering** capabilities
- **Bulk User Operations**

### 🔄 Real-time Features
- **WebSocket Integration** with Socket.IO
- **Live Task Updates** across all connected clients
- **Real-time Notifications** for task changes
- **Multi-user Collaboration** support

### 🎨 User Interface
- **Modern React Frontend** with TypeScript
- **Responsive Design** with Tailwind CSS
- **Intuitive Admin Dashboard** with comprehensive controls
- **User-friendly Task Interface** with drag-and-drop support
- **Toast Notifications** for user feedback
- **Loading States** and error handling

### 🔧 Developer Features
- **Comprehensive Testing Suite** with Jest
- **API Documentation** with Swagger/OpenAPI
- **Docker Containerization** for easy deployment
- **Development Hot Reload** support
- **Production Optimization** configurations

---

## 🛠 Tech Stack

### Backend Infrastructure
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Real-time**: Socket.IO for WebSocket communication
- **File Upload**: Multer middleware
- **Validation**: Express-validator
- **Security**: Helmet, CORS, bcryptjs
- **Testing**: Jest, Supertest, MongoDB Memory Server
- **Documentation**: Swagger UI Express

### Frontend Technologies
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit (RTK Query)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form
- **UI Components**: Custom component library
- **Real-time**: Socket.IO Client
- **Notifications**: React Hot Toast

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Process Management**: PM2
- **Database**: MongoDB with initialization scripts
- **Cloud Ready**: Railway, Render, DigitalOcean, AWS
- **Version Control**: Git with comprehensive .gitignore

---

## 📁 Project Structure

```
task-management-system/
├── 📂 client/                     # React Frontend Application
│   ├── 📂 public/                 # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/         # Reusable UI components
│   │   │   ├── 📂 common/         # Shared components
│   │   │   ├── 📂 forms/          # Form components
│   │   │   └── 📂 layout/         # Layout components
│   │   ├── 📂 pages/              # Page components
│   │   │   ├── 📂 admin/          # Admin dashboard pages
│   │   │   ├── 📂 auth/           # Authentication pages
│   │   │   └── 📂 tasks/          # Task management pages
│   │   ├── 📂 store/              # Redux store configuration
│   │   │   ├── 📂 api/            # RTK Query API slices
│   │   │   └── 📂 slices/         # Redux slices
│   │   ├── 📂 hooks/              # Custom React hooks
│   │   ├── 📂 utils/              # Utility functions
│   │   ├── 📂 types/              # TypeScript type definitions
│   │   └── 📂 styles/             # Global styles
│   ├── 📄 package.json            # Frontend dependencies
│   ├── 📄 tailwind.config.js      # Tailwind CSS configuration
│   ├── 📄 tsconfig.json           # TypeScript configuration
│   └── 📄 Dockerfile              # Frontend Docker configuration
├── 📂 server/                     # Node.js Backend Application
│   ├── 📂 src/
│   │   ├── 📂 config/             # Configuration files
│   │   │   ├── 📄 database.js     # MongoDB connection
│   │   │   └── 📄 swagger.js      # API documentation setup
│   │   ├── 📂 controllers/        # Request handlers
│   │   │   ├── 📄 authController.js    # Authentication logic
│   │   │   ├── 📄 taskController.js    # Task CRUD operations
│   │   │   └── 📄 userController.js    # User management
│   │   ├── 📂 middleware/         # Custom middleware
│   │   │   ├── 📄 auth.js         # JWT verification
│   │   │   ├── 📄 authorize.js    # Role-based authorization
│   │   │   ├── 📄 upload.js       # File upload handling
│   │   │   └── 📄 errorHandler.js # Global error handling
│   │   ├── 📂 models/             # Mongoose schemas
│   │   │   ├── 📄 User.js         # User model with roles
│   │   │   └── 📄 Task.js         # Task model with relationships
│   │   ├── 📂 routes/             # API route definitions
│   │   │   ├── 📄 auth.js         # Authentication routes
│   │   │   ├── 📄 tasks.js        # Task management routes
│   │   │   └── 📄 users.js        # User management routes
│   │   ├── 📂 utils/              # Utility functions
│   │   │   ├── 📄 socketHandlers.js   # Socket.IO event handlers
│   │   │   ├── 📄 seedData.js     # Database seeding
│   │   │   └── 📄 validators.js   # Input validation rules
│   │   ├── 📂 uploads/            # File storage directory
│   │   └── 📄 server.js           # Main application entry point
│   ├── 📂 tests/                  # Comprehensive test suite
│   │   ├── 📂 integration/        # API integration tests
│   │   ├── 📂 unit/               # Unit tests
│   │   │   ├── 📂 controllers/    # Controller tests
│   │   │   ├── 📂 middleware/     # Middleware tests
│   │   │   └── 📂 models/         # Model tests
│   │   └── 📂 utils/              # Test utilities
│   ├── 📄 package.json            # Backend dependencies
│   ├── 📄 jest.config.js          # Jest testing configuration
│   ├── 📄 Dockerfile              # Backend Docker configuration
│   └── 📄 init-mongo.js           # MongoDB initialization script
├── 📂 .do/                        # DigitalOcean App Platform config
├── 📂 nginx/                      # Nginx configuration files
├── 📄 docker-compose.yml          # Production Docker configuration
├── 📄 docker-compose.dev.yml      # Development Docker configuration
├── 📄 docker-compose.prod.yml     # Advanced production configuration
├── 📄 .env.example               # Environment variables template
├── 📄 .gitignore                 # Git ignore rules
├── 📄 render.yaml                # Render deployment configuration
├── 📄 railway.json               # Railway deployment configuration
├── 📄 start.sh                   # Linux/Mac startup script
├── 📄 start.bat                  # Windows startup script
├── 📄 DOCKER_README.md           # Docker-specific documentation
├── 📄 TEST_GUIDE.md              # Testing guidelines
└── 📄 README.md                  # This comprehensive guide
```

---

## 🚀 Quick Start

### Option 1: One-Command Docker Setup (Recommended)

```bash
# Clone the repository
git clone <your-repository-url>
cd task-management-system

# Start everything with Docker
docker-compose up

# Or use convenience scripts:
# For Linux/Mac:
./start.sh

# For Windows:
start.bat
```

**🎉 That's it! Your application is now running:**
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api-docs
- **MongoDB**: localhost:27017

### 🔑 Default Login Credentials
- **Email**: `admin@taskmanagement.com`
- **Password**: `admin123`

---

## 🔧 Installation Methods

### 🐳 Docker Installation (Recommended)

#### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)

#### Production Mode
```bash
docker-compose up -d
```

#### Development Mode (with hot reload)
```bash
docker-compose -f docker-compose.dev.yml up
```

#### Clean Installation
```bash
# Remove everything and start fresh
docker-compose down -v --rmi all
docker-compose up --build
```

### 💻 Manual Installation

#### Prerequisites
- Node.js (v18+)
- MongoDB (v5.0+)
- npm or yarn

#### Backend Setup
```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Or start production server
npm start
```

#### Frontend Setup
```bash
cd client
npm install

# Start development server
npm start

# Build for production
npm run build
```

#### Database Setup
```bash
# Start MongoDB (if installed locally)
mongod

# Seed initial data
cd server
npm run seed
```

---

## ⚙️ Environment Configuration

### 🔐 Server Environment Variables

Create a `.env` file in the `server` directory:

```env
# ================================
# Server Configuration
# ================================
PORT=5000
NODE_ENV=development

# ================================
# Database Configuration
# ================================
MONGODB_URI=mongodb://localhost:27017/taskmanagement
DB_NAME=taskmanagement

# ================================
# JWT Configuration
# ================================
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=7d

# ================================
# File Upload Configuration
# ================================
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./src/uploads

# ================================
# CORS Configuration
# ================================
CORS_ORIGIN=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# ================================
# Security Configuration
# ================================
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ================================
# Production Specific
# ================================
# MONGODB_URI=mongodb://mongo:27017/taskmanagement
# CORS_ORIGIN=https://yourdomain.com
```

### 🎨 Client Environment Variables

Create a `.env` file in the `client` directory:

```env
# ================================
# API Configuration
# ================================
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# ================================
# Production Configuration
# ================================
# REACT_APP_API_URL=https://your-api-domain.com/api
# REACT_APP_SOCKET_URL=https://your-api-domain.com
```

---

## 📚 API Documentation

### 🔗 Interactive Documentation
Visit http://localhost:5000/api-docs for complete interactive API documentation with Swagger UI.

### 🎯 Key API Endpoints

#### Authentication
```http
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
GET  /api/auth/me               # Get current user
PUT  /api/auth/me               # Update current user
```

#### Task Management
```http
GET    /api/tasks               # Get all tasks (with pagination & filters)
POST   /api/tasks               # Create new task
GET    /api/tasks/:id           # Get specific task
PUT    /api/tasks/:id           # Update task
DELETE /api/tasks/:id           # Delete task
```

#### User Management (Admin Only)
```http
GET    /api/users               # Get all users
POST   /api/users               # Create new user
GET    /api/users/:id           # Get specific user
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user
```

#### File Upload
```http
POST /api/tasks/:id/upload      # Upload file to task
GET  /api/tasks/:id/download    # Download task file
```

### 📊 Request/Response Examples

#### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Project Documentation",
    "description": "Write comprehensive README and API docs",
    "priority": "high",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "assignedTo": "user-id-here"
  }'
```

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345",
    "title": "Complete Project Documentation",
    "description": "Write comprehensive README and API docs",
    "priority": "high",
    "status": "pending",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "assignedTo": {
      "_id": "user-id-here",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdBy": "admin-user-id",
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-10T10:30:00.000Z"
  }
}
```

---

## 🧪 Testing

### 🎯 Test Coverage
- **Unit Tests**: Models, Controllers, Middleware
- **Integration Tests**: API endpoints, Database operations
- **Frontend Tests**: Components, Redux slices, API integration

### 🏃‍♂️ Running Tests

#### Backend Tests
```bash
cd server

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run tests for CI/CD
npm run test:ci
```

#### Frontend Tests
```bash
cd client

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### 📊 Test Structure

```
tests/
├── 📂 integration/
│   ├── auth.test.js           # Authentication flow tests
│   ├── tasks.test.js          # Task management tests
│   └── users.test.js          # User management tests
├── 📂 unit/
│   ├── 📂 controllers/
│   │   ├── authController.test.js
│   │   ├── taskController.test.js
│   │   └── userController.test.js
│   ├── 📂 middleware/
│   │   ├── auth.test.js
│   │   └── authorize.test.js
│   └── 📂 models/
│       ├── User.test.js
│       └── Task.test.js
└── 📂 utils/
    ├── testSetup.js           # Test environment setup
    └── testHelpers.js         # Test utility functions
```

---

## 🌐 Deployment

### ☁️ Cloud Platform Deployment

#### 🚂 Railway
```bash
# Connect to Railway
railway login
railway link

# Deploy
railway up
```

#### 🎨 Render
1. Connect your GitHub repository
2. Use the provided `render.yaml` configuration
3. Set environment variables in Render dashboard

#### 🌊 DigitalOcean App Platform
1. Use the `.do/app.yaml` configuration
2. Connect your GitHub repository
3. Deploy with one click

#### ☁️ AWS/Heroku
```bash
# For Heroku
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
```

### 🐳 VPS/Server Deployment

#### Prerequisites
- Ubuntu 20.04+ server
- Docker & Docker Compose installed
- Domain name (optional)

#### Deployment Steps
```bash
# Clone repository
git clone <your-repo-url>
cd task-management-system

# Set up environment variables
cp .env.example server/.env
# Edit server/.env with production values

# Start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Set up Nginx (optional)
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🐳 Docker Configuration

### 📋 Available Docker Compositions

#### Production (docker-compose.yml)
- **MongoDB**: Persistent data storage
- **Server**: Node.js API backend
- **Client**: Nginx-served React frontend
- **Networking**: Internal communication

#### Development (docker-compose.dev.yml)
- **Hot Reload**: Enabled for both frontend and backend
- **Volume Mounting**: Live code changes
- **Debug Support**: Exposed debugging ports

#### Advanced Production (docker-compose.prod.yml)
- **Health Checks**: Automatic service monitoring
- **Restart Policies**: Automatic recovery
- **Resource Limits**: Memory and CPU constraints
- **Environment Variables**: Externalized configuration

### 🔧 Docker Commands

```bash
# Build and start services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Complete cleanup
docker-compose down -v --rmi all

# Scale services
docker-compose up --scale server=3
```

### 📊 Service Health Monitoring

```bash
# Check service status
docker-compose ps

# Monitor resource usage
docker stats

# View service logs
docker-compose logs server
docker-compose logs client
docker-compose logs mongo
```

---

## 👨‍💻 Development Guidelines

### 🏗️ Code Structure
- **MVC Pattern**: Clear separation of concerns
- **Middleware Chain**: Modular request processing
- **Service Layer**: Business logic abstraction
- **Repository Pattern**: Data access abstraction

### 📝 Coding Standards
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality control
- **Conventional Commits**: Standardized commit messages

### 🔄 Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and test
npm run test
npm run lint

# 3. Commit changes
git add .
git commit -m "feat: add new feature"

# 4. Push and create PR
git push origin feature/new-feature
```

### 🎯 Best Practices
- **Error Handling**: Comprehensive try-catch blocks
- **Input Validation**: Server-side validation for all inputs
- **Security**: JWT tokens, password hashing, CORS
- **Performance**: Database indexing, query optimization
- **Documentation**: JSDoc comments for functions

---

## 🛠 Troubleshooting

### 🚨 Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or use different port
PORT=5001 npm start
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo

# Clear MongoDB data
docker-compose down -v
```

#### Docker Issues
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Docker logs
docker-compose logs -f service-name
```

#### File Upload Issues
```bash
# Check upload directory permissions
ls -la server/src/uploads/

# Create upload directory
mkdir -p server/src/uploads
chmod 755 server/src/uploads
```

### 🔍 Debug Mode

#### Backend Debug
```bash
cd server
DEBUG=app:* npm run dev
```

#### Frontend Debug
```bash
cd client
REACT_APP_DEBUG=true npm start
```

### 📋 Health Checks

#### Application Health
```bash
curl http://localhost:5000/api/health
```

#### Database Health
```bash
curl http://localhost:5000/api/health/db
```

---

## 🤝 Contributing

### 🌟 How to Contribute

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### 📋 Contribution Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

### 🐛 Bug Reports
Use GitHub Issues with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details

### 💡 Feature Requests
- Describe the feature
- Explain the use case
- Provide implementation ideas

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

### 🛠 Technologies
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [React](https://reactjs.org/) - UI library for building user interfaces
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Socket.IO](https://socket.io/) - Real-time communication
- [Docker](https://www.docker.com/) - Containerization platform
- [Jest](https://jestjs.io/) - JavaScript testing framework

### 📚 Resources
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)

---

<div align="center">

## 🌟 Star this repository if you found it helpful!

**Made with ❤️ by [Your Name]**

[⬆ Back to Top](#-task-management-system)

</div>