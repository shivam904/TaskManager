require('../../tests/setup');
const Task = require('../../src/models/task.model');
const User = require('../../src/models/user.model');
const { createTestUser } = require('../utils/testHelpers');

describe('Task Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('Task Creation', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        status: 'pending',
        priority: 'medium',
        assignedTo: testUser._id,
        createdBy: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask.title).toBe(taskData.title);
      expect(savedTask.description).toBe(taskData.description);
      expect(savedTask.status).toBe(taskData.status);
      expect(savedTask.priority).toBe(taskData.priority);
      expect(savedTask.assignedTo.toString()).toBe(testUser._id.toString());
      expect(savedTask.createdBy.toString()).toBe(testUser._id.toString());
      expect(savedTask.dueDate).toEqual(taskData.dueDate);
      expect(savedTask.createdAt).toBeDefined();
      expect(savedTask.updatedAt).toBeDefined();
    });

    it('should require title field', async () => {
      const taskData = {
        description: 'Test task description',
        assignedTo: testUser._id,
        createdBy: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = new Task(taskData);
      
      try {
        await task.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.title).toBeDefined();
        expect(error.errors.title.message).toBe('Title is required');
      }
    });

    it('should require assignedTo field', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        createdBy: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = new Task(taskData);
      
      try {
        await task.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.assignedTo).toBeDefined();
        expect(error.errors.assignedTo.message).toBe('Task must be assigned to a user');
      }
    });

    it('should require createdBy field', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        assignedTo: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = new Task(taskData);
      
      try {
        await task.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.createdBy).toBeDefined();
        expect(error.errors.createdBy.message).toBe('Task creator is required');
      }
    });

    it('should have default status as pending', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        assignedTo: testUser._id,
        createdBy: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask.status).toBe('pending');
    });

    it('should have default priority as medium', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        assignedTo: testUser._id,
        createdBy: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask.priority).toBe('medium');
    });

    it('should validate status enum values', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        status: 'invalid-status',
        assignedTo: testUser._id,
        createdBy: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = new Task(taskData);
      
      try {
        await task.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.status).toBeDefined();
        expect(error.errors.status.message).toContain('not a valid enum value');
      }
    });

    it('should validate priority enum values', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        priority: 'invalid-priority',
        assignedTo: testUser._id,
        createdBy: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = new Task(taskData);
      
      try {
        await task.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.priority).toBeDefined();
        expect(error.errors.priority.message).toContain('not a valid enum value');
      }
    });

    it('should accept valid status values', async () => {
      const validStatuses = ['pending', 'in-progress', 'completed'];
      
      for (const status of validStatuses) {
        const taskData = {
          title: 'Test Task',
          description: 'Test task description',
          status: status,
          assignedTo: testUser._id,
          createdBy: testUser._id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        const task = new Task(taskData);
        const savedTask = await task.save();

        expect(savedTask.status).toBe(status);
        
        // Clean up for next iteration
        await Task.findByIdAndDelete(savedTask._id);
      }
    });

    it('should accept valid priority values', async () => {
      const validPriorities = ['low', 'medium', 'high'];
      
      for (const priority of validPriorities) {
        const taskData = {
          title: 'Test Task',
          description: 'Test task description',
          priority: priority,
          assignedTo: testUser._id,
          createdBy: testUser._id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        const task = new Task(taskData);
        const savedTask = await task.save();

        expect(savedTask.priority).toBe(priority);
        
        // Clean up for next iteration
        await Task.findByIdAndDelete(savedTask._id);
      }
    });

    it('should store documents array', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        assignedTo: testUser._id,
        createdBy: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        documents: [
          {
            filename: 'test-file.pdf',
            originalName: 'Test File.pdf',
            path: '/uploads/test-file.pdf',
            mimetype: 'application/pdf',
            size: 1024
          }
        ]
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask.documents).toHaveLength(1);
      expect(savedTask.documents[0].filename).toBe('test-file.pdf');
      expect(savedTask.documents[0].originalName).toBe('Test File.pdf');
      expect(savedTask.documents[0].uploadedAt).toBeDefined();
    });
  });

  describe('Task Relationships', () => {
    it('should populate assignedTo user', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        assignedTo: testUser._id,
        createdBy: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      const populatedTask = await Task.findById(savedTask._id).populate('assignedTo');
      
      expect(populatedTask.assignedTo).toBeDefined();
      expect(populatedTask.assignedTo.name).toBe(testUser.name);
      expect(populatedTask.assignedTo.email).toBe(testUser.email);
    });

    it('should populate createdBy user', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        assignedTo: testUser._id,
        createdBy: testUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      const populatedTask = await Task.findById(savedTask._id).populate('createdBy');
      
      expect(populatedTask.createdBy).toBeDefined();
      expect(populatedTask.createdBy.name).toBe(testUser.name);
      expect(populatedTask.createdBy.email).toBe(testUser.email);
    });
  });

  describe('Task Schema', () => {
    it('should have correct schema fields', () => {
      const taskPaths = Task.schema.paths;
      
      expect(taskPaths.title).toBeDefined();
      expect(taskPaths.description).toBeDefined();
      expect(taskPaths.status).toBeDefined();
      expect(taskPaths.priority).toBeDefined();
      expect(taskPaths.assignedTo).toBeDefined();
      expect(taskPaths.createdBy).toBeDefined();
      expect(taskPaths.dueDate).toBeDefined();
      expect(taskPaths.documents).toBeDefined();
      expect(taskPaths.createdAt).toBeDefined();
      expect(taskPaths.updatedAt).toBeDefined();
    });

    it('should have timestamps enabled', () => {
      const schemaOptions = Task.schema.options;
      expect(schemaOptions.timestamps).toBe(true);
    });

    it('should have correct field types', () => {
      const taskPaths = Task.schema.paths;
      
      expect(taskPaths.title.instance).toBe('String');
      expect(taskPaths.description.instance).toBe('String');
      expect(taskPaths.status.instance).toBe('String');
      expect(taskPaths.priority.instance).toBe('String');
      expect(taskPaths.assignedTo.instance).toBe('ObjectId');
      expect(taskPaths.createdBy.instance).toBe('ObjectId');
      expect(taskPaths.dueDate.instance).toBe('Date');
    });
  });
}); 