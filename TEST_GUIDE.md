# Test Guide - Task Management System

## Overview
This project includes comprehensive Jest tests for both backend and frontend components.

## Backend Tests (Server)

### Test Structure
- **Models**: User and Task model validation
- **Controllers**: Auth and Task business logic
- **Middleware**: Authentication and authorization
- **Routes**: API endpoint integration tests

### Running Backend Tests
```bash
cd server
npm test                # Run all tests with coverage
npm run test:watch      # Watch mode
npm run test:ci         # CI mode
```

### Key Test Files
- `tests/models/user.model.test.js` - User model tests
- `tests/models/task.model.test.js` - Task model tests
- `tests/controllers/auth.controller.test.js` - Auth controller tests
- `tests/controllers/task.controller.test.js` - Task controller tests
- `tests/middleware/auth.middleware.test.js` - Auth middleware tests
- `tests/routes/auth.routes.test.js` - Auth routes integration tests

## Frontend Tests (Client)

### Test Structure
- **Components**: React component rendering and interaction
- **Redux**: State management and async actions
- **Integration**: User workflows and navigation

### Running Frontend Tests
```bash
cd client
npm test                # Run all tests with coverage
npm run test:watch      # Watch mode
npm run test:ci         # CI mode
```

### Key Test Files
- `src/__tests__/Login.test.tsx` - Login component tests
- `src/__tests__/TaskList.test.tsx` - Task list component tests
- `src/__tests__/authSlice.test.ts` - Redux auth slice tests

## Test Features

### Backend Testing
- MongoDB Memory Server for isolated database testing
- Supertest for API endpoint testing
- JWT token generation and validation
- File upload and error handling
- Real-time socket.io event testing

### Frontend Testing
- React Testing Library for component testing
- Redux store mocking and testing
- User event simulation
- Form validation testing
- Navigation and routing tests

## Test Coverage
Both backend and frontend maintain >80% test coverage across statements, branches, functions, and lines.

## Test Utilities

### Backend Helpers (`tests/utils/testHelpers.js`)
- `createTestUser()` - Create test users with hashed passwords
- `createTestTask()` - Create test tasks with relationships
- `generateTestToken()` - Generate valid JWT tokens
- `mockRequest()`, `mockResponse()`, `mockNext()` - Express mocks

### Frontend Helpers
- `renderWithProviders()` - Render components with Redux and Router
- `createMockStore()` - Create mock Redux stores with initial state
- User event utilities for form interactions

## Configuration

### Backend Jest Config (`jest.config.js`)
- Node.js test environment
- MongoDB Memory Server setup
- Coverage collection from src files
- Test file patterns and exclusions

### Frontend Jest Config
- React Testing Library setup
- jsdom environment
- Coverage reporting
- Mock configurations

## Running All Tests
```bash
# From project root
cd server && npm test && cd ../client && npm test
```

## Best Practices
1. Write descriptive test names
2. Test both success and error scenarios
3. Mock external dependencies
4. Clean up test data after each test
5. Use proper async/await patterns
6. Test user interactions and accessibility 