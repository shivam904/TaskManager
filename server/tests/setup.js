const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set test environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

let mongod;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(uri);
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  // Clear all collections after each test
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close the database connection
  await mongoose.connection.close();
  
  // Stop the in-memory MongoDB instance
  if (mongod) {
    await mongod.stop();
  }
});

// Increase timeout for database operations
jest.setTimeout(30000); 