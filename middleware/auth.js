const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({errors: [{msg: "Access denied! No token found"}]});
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    req.user = decoded.user;
    next();
  } catch(error) {
    return res.status(401).json({errors: [{msg: "Access denied! Invalid token found"}]});
  }
};