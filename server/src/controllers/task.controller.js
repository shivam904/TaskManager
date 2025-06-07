const Task = require('../models/task.model');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// @desc    Get all tasks with filtering and sorting
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Filter by due date range
    if (req.query.dueDateStart && req.query.dueDateEnd) {
      query.dueDate = {
        $gte: new Date(req.query.dueDateStart),
        $lte: new Date(req.query.dueDateEnd),
      };
    } else if (req.query.dueDateStart) {
      query.dueDate = { $gte: new Date(req.query.dueDateStart) };
    } else if (req.query.dueDateEnd) {
      query.dueDate = { $lte: new Date(req.query.dueDateEnd) };
    }

    // Filter by assigned user
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    // Regular users can only see tasks assigned to them or created by them
    if (req.user.role !== 'admin') {
      query.$or = [
        { assignedTo: req.user.id },
        { createdBy: req.user.id },
      ];
    }

    // Sort
    let sortBy = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sortBy[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sortBy = { createdAt: -1 };
    }

    // Execute query
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email',
      })
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    // Total count
    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email',
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has permission to view the task
    if (
      req.user.role !== 'admin' &&
      task.assignedTo._id.toString() !== req.user.id &&
      task.createdBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    // Create task
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user.id,
      documents: [],
    });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const documents = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));

      task.documents = documents;
      await task.save();
    }

    // Emit socket event
    req.app.get('io').emit('taskUpdate', { action: 'create', task });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    // Clean up uploaded files in case of error
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Find task
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has permission to update the task
    if (
      req.user.role !== 'admin' &&
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    // Update task
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, assignedTo },
      { new: true, runValidators: true }
    );

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      // Check if adding new files would exceed the limit
      if (task.documents.length + req.files.length > 3) {
        // Clean up uploaded files
        req.files.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });

        return res.status(400).json({
          success: false,
          message: 'Maximum 3 documents allowed per task',
        });
      }

      const newDocuments = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));

      task.documents = [...task.documents, ...newDocuments];
      await task.save();
    }

    // Emit socket event
    req.app.get('io').emit('taskUpdate', { action: 'update', task });

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    // Clean up uploaded files in case of error
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has permission to delete the task
    if (
      req.user.role !== 'admin' &&
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }

    // Delete associated files
    if (task.documents && task.documents.length > 0) {
      task.documents.forEach((doc) => {
        fs.unlink(doc.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Emit socket event
    req.app.get('io').emit('taskUpdate', { action: 'delete', taskId: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document from task
// @route   DELETE /api/tasks/:id/documents/:docId
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has permission
    if (
      req.user.role !== 'admin' &&
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this task',
      });
    }

    // Find document
    const document = task.documents.id(req.params.docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Delete file from filesystem
    fs.unlink(document.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    // Remove document from task
    task.documents.pull(req.params.docId);
    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download document
// @route   GET /api/tasks/:id/documents/:docId/download
// @access  Private
exports.downloadDocument = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has permission to view the task
    if (
      req.user.role !== 'admin' &&
      task.assignedTo.toString() !== req.user.id &&
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    // Find document
    const document = task.documents.id(req.params.docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Send file
    res.download(document.path, document.originalName);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Find task
    let task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Allow access to task status update for:
    // 1. Admin
    // 2. Task creator
    // 3. User assigned to the task
    const isAdmin = req.user.role === 'admin';
    const isCreator = task.createdBy._id.toString() === req.user.id;
    const isAssigned = task.assignedTo._id.toString() === req.user.id;

    if (!isAdmin && !isCreator && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task status',
      });
    }

    const { status } = req.body;

    // Update task status
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Emit socket event
    req.app.get('io').emit('taskUpdate', { action: 'update', task });

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Find task
    let task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email',
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has permission to add comments
    // Allow access to comments for:
    // 1. Admin
    // 2. Task creator
    // 3. User assigned to the task
    const isAdmin = req.user.role === 'admin';
    const isCreator = task.createdBy._id.toString() === req.user.id;
    const isAssigned = task.assignedTo._id.toString() === req.user.id;

    if (!isAdmin && !isCreator && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task',
      });
    }

    const { text } = req.body;

    // Add comment
    const comment = {
      text,
      user: req.user.id,
    };

    task.comments.push(comment);
    await task.save();

    // Reload task with populated comment user
    task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email',
      });

    // Emit socket event
    req.app.get('io').emit('taskUpdate', { action: 'comment', task });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}; 