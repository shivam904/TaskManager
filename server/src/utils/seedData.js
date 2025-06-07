const mongoose = require('mongoose');
const User = require('../models/user.model');
const Task = require('../models/task.model');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});

    console.log('Previous data cleared');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('Admin user created');

    // Create regular users
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'user',
    });

    console.log('Regular users created');

    // Create tasks
    const tasks = [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the project',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        assignedTo: user1._id,
        createdBy: admin._id,
      },
      {
        title: 'Fix login bug',
        description: 'Fix the bug in the login form that prevents users from logging in',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        assignedTo: user2._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement search feature',
        description: 'Add search functionality to the application',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        assignedTo: user1._id,
        createdBy: user2._id,
      },
      {
        title: 'Update dependencies',
        description: 'Update all npm packages to their latest versions',
        status: 'completed',
        priority: 'low',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        assignedTo: user2._id,
        createdBy: user1._id,
      },
    ];

    await Task.insertMany(tasks);

    console.log('Tasks created');
    console.log('Database seeded successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData(); 