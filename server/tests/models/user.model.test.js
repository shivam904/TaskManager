require('../../tests/setup');
const User = require('../../src/models/user.model');
const { testUserData } = require('../utils/testHelpers');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Password should be hashed
      expect(savedUser.password).toMatch(/^\$2b\$10\$/); // Bcrypt hash pattern
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should require name field', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.name).toBeDefined();
        expect(error.errors.name.message).toBe('Name is required');
      }
    });

    it('should require email field', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123'
      };

      const user = new User(userData);
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.email).toBeDefined();
        expect(error.errors.email.message).toBe('Email is required');
      }
    });

    it('should require password field', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const user = new User(userData);
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.password).toBeDefined();
        expect(error.errors.password.message).toBe('Password is required');
      }
    });

    it('should require unique email', async () => {
      const userData1 = {
        name: 'Test User 1',
        email: 'test@example.com',
        password: 'password123'
      };

      const userData2 = {
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'password456'
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      
      try {
        await user2.save();
        fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      }
    });

    it('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const user = new User(userData);
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.email).toBeDefined();
        expect(error.errors.email.message).toBe('Please provide a valid email');
      }
    });

    it('should enforce minimum password length', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      const user = new User(userData);
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.password).toBeDefined();
        expect(error.errors.password.message).toBe('Password must be at least 6 characters');
      }
    });
  });

  describe('User Methods', () => {
    let user;

    beforeEach(async () => {
      user = new User(testUserData);
      await user.save();
    });

    it('should have comparePassword method', () => {
      expect(typeof user.comparePassword).toBe('function');
    });

    it('should correctly compare valid password', async () => {
      const isMatch = await user.comparePassword(testUserData.password);
      expect(isMatch).toBe(true);
    });

    it('should correctly compare invalid password', async () => {
      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });

    it('should not return password field by default', async () => {
      // Find user without explicitly selecting password
      const foundUser = await User.findById(user._id);
      expect(foundUser.password).toBeUndefined();
    });

    it('should return password when explicitly selected', async () => {
      // Find user with password explicitly selected
      const foundUser = await User.findById(user._id).select('+password');
      expect(foundUser.password).toBeDefined();
      expect(foundUser.password).toMatch(/^\$2b\$10\$/);
    });
  });

  describe('User Schema', () => {
    it('should have correct schema fields', () => {
      const userPaths = User.schema.paths;
      
      expect(userPaths.name).toBeDefined();
      expect(userPaths.email).toBeDefined();
      expect(userPaths.password).toBeDefined();
      expect(userPaths.role).toBeDefined();
      expect(userPaths.createdAt).toBeDefined();
      expect(userPaths.updatedAt).toBeDefined();
    });

    it('should have timestamps enabled', () => {
      const schemaOptions = User.schema.options;
      expect(schemaOptions.timestamps).toBe(true);
    });
  });
}); 