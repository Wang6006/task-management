const { z } = require("zod");

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const createAccountSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).optional().default("user"),
});

module.exports = {
  loginSchema,
  createAccountSchema,
};
