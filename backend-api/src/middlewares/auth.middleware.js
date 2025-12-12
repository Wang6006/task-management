const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return next(new ApiError(401, "Access token is missing"));
  }


  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Gán thông tin user vào request để dùng sau
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return next(new ApiError(401, 'Invalid or expired token'));
  }

}

function isAdmin(req, res, next) {
  if (req.user?.role === "admin") {
    return next();
  }
  return next(new ApiError(403, "Admin access required"));
}
function isUser(req, res, next) {
  if (req.user?.role === "user") {
    return next();
  }
  return next(new ApiError(403, "Admin access required"));
}
module.exports = {
  authenticateToken,
  isAdmin,
  isUser,
};
