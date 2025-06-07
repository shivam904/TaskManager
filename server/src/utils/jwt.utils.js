const jwt = require('jsonwebtoken');

// Generate JWT token
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "hello859hello",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// Generate response with token
exports.generateAuthResponse = (user, statusCode, res) => {
  const token = this.generateToken(user);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
}; 