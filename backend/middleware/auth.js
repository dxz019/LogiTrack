const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function (req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.', code: 'MISSING_TOKEN' });
  }

  try {
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.', code: 'INVALID_TOKEN' });
  }
};