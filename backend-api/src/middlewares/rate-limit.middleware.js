const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000000,
  message: {
    status: "fail",
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message: "Too many authentication attempts, please try again later.",
    });
  },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 15 phút
  max: 100,
  message: {
    status: "fail",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message: "Too many requests, please try again later.",
    });
  },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    status: "fail",
    message: "Too many file uploads, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message: "Too many file uploads, please try again later.",
    });
  },
});

const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: {
    status: "fail",
    message: "Too many search requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message: "Too many search requests, please try again later.",
    });
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  searchLimiter,
};
