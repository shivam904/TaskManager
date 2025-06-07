const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user.model');
const Task = require('../../src/models/task.model');

// Test user data
const testUserData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

const testUserData2 = {
  name: 'Test User 2',
  email: 'test2@example.com',
  password: 'password123'
};

// Test task data
const testTaskData = {
  title: 'Test Task',
  description: 'Test task description',
  status: 'pending',
  priority: 'medium',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
};

// Create test user
const createTestUser = async (userData = testUserData) => {
  const user = new User({
    name: userData.name,
    email: userData.email,
    password: userData.password // Let the model's pre-save middleware hash it
  });
  
  return await user.save();
};

// Create test task
const createTestTask = async (userId, taskData = testTaskData) => {
  const task = new Task({
    ...taskData,
    assignedTo: userId,
    createdBy: userId
  });
  
  return await task.save();
};

// Generate JWT token for test user
const generateTestToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// Create authenticated user with token
const createAuthenticatedUser = async (userData = testUserData) => {
  const user = await createTestUser(userData);
  const token = generateTestToken(user._id);
  
  return { user, token };
};

// Mock request object
const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  file: null,
  ...overrides
});

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
const mockNext = jest.fn();

module.exports = {
  testUserData,
  testUserData2,
  testTaskData,
  createTestUser,
  createTestTask,
  generateTestToken,
  createAuthenticatedUser,
  mockRequest,
  mockResponse,
  mockNext
}; 