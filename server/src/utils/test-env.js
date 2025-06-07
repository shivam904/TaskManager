const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Print environment variables
console.log('Environment Variables:');
console.log('---------------------');
console.log(`PORT: ${process.env.PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET}`);
console.log(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}`);
console.log(`UPLOAD_PATH: ${process.env.UPLOAD_PATH}`);
console.log('---------------------');

// Exit the process
process.exit(0); 