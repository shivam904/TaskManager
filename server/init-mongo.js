// MongoDB initialization script
db = db.getSiblingDB('taskmanagement');

// Create collections
db.createCollection('users');
db.createCollection('tasks');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.tasks.createIndex({ "createdBy": 1 });
db.tasks.createIndex({ "assignedTo": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "priority": 1 });
db.tasks.createIndex({ "dueDate": 1 });

// Create an admin user (password: admin123)
// Note: In production, you should hash the password properly
db.users.insertOne({
    name: "System Admin",
    email: "admin@taskmanagement.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // admin123
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date()
});

print('Database initialized successfully');
print('Default admin user created: admin@taskmanagement.com / admin123');
print('Please change the default credentials in production!'); 