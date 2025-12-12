const authService = require("../services/auth.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function login(req, res, next) {
  try {
    console.log("[Backend] Received login request:", req.body);
    const { username, password } = req.body;
    console.log("Login attempt with username:", username);
    if (!username || !password) {
      throw new ApiError(400, "Username and password are required");
    }

    const result = await authService.login(username, password);
    return res.json(JSend.success(result));
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      throw new ApiError(400, "Username, email and password are required");
    }

    if (await authService.isUsernameExists(username)) {
      throw new ApiError(400, "Username already exists");
    }

    if (await authService.isEmailExists(email)) {
      throw new ApiError(400, "Email already exists");
    }

    const result = await authService.register({
      username,
      email,
      password,
      role,
    });
    return res.status(201).json(JSend.success(result));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
};
