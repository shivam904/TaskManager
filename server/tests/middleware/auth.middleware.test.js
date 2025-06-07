const jwt = require('jsonwebtoken');
const User = require('../../src/models/user.model');
const { protect, authorize } = require('../../src/middleware/auth.middleware');
const {
  createTestUser,
  generateTestToken,
  mockRequest,
  mockResponse,
  mockNext
} = require('../utils/testHelpers');

describe('Auth Middleware', () => {
  let req, res, next, testUser;

  beforeEach(async () => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    testUser = await createTestUser();
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should authenticate user with valid token', async () => {
          const token = generateTestToken(testUser._id);
    req.headers.authorization = `Bearer ${token}`;

    await protect(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user._id.toString()).toBe(testUser._id.toString());
    expect(next).toHaveBeenCalledWith();
    });

    it('should return 401 for missing token', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this route'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token format', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this route'
      });
    });

    it('should return 401 for invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this route'
      });
    });

    it('should return 401 for expired token', async () => {
      const expiredToken = jwt.sign(
        { id: testUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );
      req.headers.authorization = `Bearer ${expiredToken}`;

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this route'
      });
    });

    it('should return 401 for non-existent user', async () => {
      const token = jwt.sign(
        { id: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET || 'test-secret'
      );
      req.headers.authorization = `Bearer ${token}`;

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found with this ID'
      });
    });

    it('should handle database errors', async () => {
      const token = generateTestToken(testUser._id);
      req.headers.authorization = `Bearer ${token}`;

      jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('Database error'));

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this route'
      });
    });

    it('should handle missing authorization header', async () => {
      req.headers = {};

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this route'
      });
    });
  });

  describe('authorize middleware', () => {
    beforeEach(() => {
      req.user = {
        _id: testUser._id,
        role: 'user'
      };
    });

    it('should allow access for authorized role', () => {
      const middleware = authorize('user', 'admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User role user is not authorized to access this route'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow access for admin role', () => {
      req.user.role = 'admin';
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should allow access for multiple authorized roles', () => {
      req.user.role = 'moderator';
      const middleware = authorize('user', 'moderator', 'admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access when no roles match', () => {
      req.user.role = 'guest';
      const middleware = authorize('user', 'admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User role guest is not authorized to access this route'
      });
    });
  });
}); 