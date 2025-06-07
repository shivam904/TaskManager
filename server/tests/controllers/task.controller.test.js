const taskController = require('../../src/controllers/task.controller');
const Task = require('../../src/models/task.model');
const {
  createTestUser,
  createTestTask,
  mockRequest,
  mockResponse,
  mockNext
} = require('../utils/testHelpers');

// Mock express-validator
const mockValidationResult = jest.fn(() => ({
  isEmpty: () => true,
  array: () => []
}));

jest.mock('express-validator', () => ({
  validationResult: mockValidationResult
}));

// Mock fs module
jest.mock('fs', () => ({
  unlink: jest.fn((path, callback) => callback && callback())
}));

describe('Task Controller', () => {
  let req, res, next, testUser, testUser2;

  beforeEach(async () => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    
    testUser = await createTestUser();
    testUser2 = await createTestUser({
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123'
    });

    req.user = { id: testUser._id.toString(), role: 'user' };
    req.app = {
      get: jest.fn(() => ({
        emit: jest.fn()
      }))
    };

    jest.clearAllMocks();
    
    // Reset the validation result mock to default
    mockValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
  });

  describe('getTasks', () => {
    it('should get tasks for regular user', async () => {
      await createTestTask(testUser._id, { 
        title: 'Task 1',
        description: 'Task 1 description',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await createTestTask(testUser._id, { 
        title: 'Task 2',
        description: 'Task 2 description',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      await taskController.getTasks(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 2,
          total: 2
        })
      );
    });

    it('should handle pagination', async () => {
      await createTestTask(testUser._id, { 
        title: 'Task 1',
        description: 'Task 1 description',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await createTestTask(testUser._id, { 
        title: 'Task 2',
        description: 'Task 2 description',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      
      req.query = { page: '1', limit: '1' };

      await taskController.getTasks(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 1,
          pagination: expect.objectContaining({
            page: 1,
            limit: 1,
            totalPages: 2
          })
        })
      );
    });
  });

  describe('getTask', () => {
    it('should get task by id for authorized user', async () => {
      const testTask = await createTestTask(testUser._id);
      req.params = { id: testTask._id.toString() };

      await taskController.getTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          _id: testTask._id,
          title: testTask.title
        })
      });
    });

    it('should return 404 for non-existent task', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };

      await taskController.getTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found'
      });
    });
  });

  describe('createTask', () => {
    it('should create a new task with valid data', async () => {
      req.body = {
        title: 'New Task',
        description: 'New task description',
        assignedTo: testUser._id.toString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      await taskController.createTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          title: 'New Task',
          description: 'New task description'
        })
      });
    });

    it('should return validation errors for invalid data', async () => {
      mockValidationResult.mockReturnValueOnce({
        isEmpty: () => false,
        array: () => [{ msg: 'Title is required', param: 'title' }]
      });

      req.body = { title: '' };

      await taskController.createTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: 'Title is required', param: 'title' }]
      });
    });
  });

  describe('updateTask', () => {
    it('should update task with valid data', async () => {
      const testTask = await createTestTask(testUser._id);
      req.params = { id: testTask._id.toString() };
      req.body = {
        title: 'Updated Task',
        status: 'in-progress'
      };

      await taskController.updateTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          title: 'Updated Task',
          status: 'in-progress'
        })
      });
    });

    it('should return 403 for unauthorized user', async () => {
      const testTask = await createTestTask(testUser._id);
      req.params = { id: testTask._id.toString() };
      req.user.id = testUser2._id.toString();
      req.body = { title: 'Updated Task' };

      await taskController.updateTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to update this task'
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete task for authorized user', async () => {
      const testTask = await createTestTask(testUser._id);
      req.params = { id: testTask._id.toString() };

      await taskController.deleteTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {}
      });

      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should return 403 for unauthorized user', async () => {
      const testTask = await createTestTask(testUser._id);
      req.params = { id: testTask._id.toString() };
      req.user.id = testUser2._id.toString();

      await taskController.deleteTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to delete this task'
      });
    });
  });
}); 