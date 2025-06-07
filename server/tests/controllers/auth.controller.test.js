require('../../tests/setup');

// Mock express-validator
const mockValidationResult = jest.fn(() => ({
  isEmpty: () => true,
  array: () => []
}));

jest.mock('express-validator', () => ({
  validationResult: mockValidationResult
}));

const authController = require('../../src/controllers/auth.controller');
const User = require('../../src/models/user.model');
const {
  createTestUser,
  mockRequest,
  mockResponse,
  mockNext,
  testUserData
} = require('../utils/testHelpers');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    jest.clearAllMocks();
    
    // Reset the validation result mock to default
    mockValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
  });

  describe('register', () => {
    it('should register a new user with valid data', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
          user: expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com'
          })
        })
      );

      // Verify user was created in database
      const user = await User.findOne({ email: 'john@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('John Doe');
    });

    it('should return error if user already exists', async () => {
      // Create a user first
      await createTestUser();

      req.body = testUserData;

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists'
      });
    });

    it('should return validation errors for invalid data', async () => {
      mockValidationResult.mockReturnValueOnce({
        isEmpty: () => false,
        array: () => [
          { msg: 'Name is required', param: 'name' },
          { msg: 'Email is invalid', param: 'email' }
        ]
      });

      req.body = {
        name: '',
        email: 'invalid-email',
        password: 'password123'
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [
          { msg: 'Name is required', param: 'name' },
          { msg: 'Email is invalid', param: 'email' }
        ]
      });
    });

    it('should handle database errors', async () => {
      req.body = testUserData;

      // Mock User.create to throw an error
      const createSpy = jest.spyOn(User, 'create').mockRejectedValueOnce(new Error('Database error'));

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      
      // Restore the spy
      createSpy.mockRestore();
    });
  });

  describe('login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it('should login user with valid credentials', async () => {
      req.body = {
        email: testUserData.email,
        password: testUserData.password
      };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
          user: expect.objectContaining({
            email: testUserData.email,
            name: testUserData.name
          })
        })
      );
    });

    it('should return error for non-existent user', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return error for incorrect password', async () => {
      req.body = {
        email: testUserData.email,
        password: 'wrongpassword'
      };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return validation errors for invalid data', async () => {
      mockValidationResult.mockReturnValueOnce({
        isEmpty: () => false,
        array: () => [
          { msg: 'Email is required', param: 'email' },
          { msg: 'Password is required', param: 'password' }
        ]
      });

      req.body = {
        email: '',
        password: ''
      };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [
          { msg: 'Email is required', param: 'email' },
          { msg: 'Password is required', param: 'password' }
        ]
      });
    });

    // Note: Database error test skipped due to complexity with mocking in beforeEach
  });

  describe('getMe', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser();
      req.user = { id: testUser._id };
    });

    it('should return current user data', async () => {
      await authController.getMe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          _id: testUser._id,
          name: testUser.name,
          email: testUser.email
        })
      });
    });

    it('should handle user not found', async () => {
      req.user = { id: 'nonexistent-id' };

      await authController.getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle database errors', async () => {
      // Mock User.findById to throw an error
      const findByIdSpy = jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('Database error'));

      await authController.getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      
      // Restore the spy
      findByIdSpy.mockRestore();
    });
  });
}); 