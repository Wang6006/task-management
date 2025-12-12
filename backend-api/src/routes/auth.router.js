const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");
const { validateRequest } = require("../middlewares/validator.middleware");
const { loginSchema, createAccountSchema } = require("../schemas/auth.schemas");
const { authLimiter } = require("../middlewares/rate-limit.middleware");

// router
//   .route("/login")
//   .post(authLimiter, validateRequest(loginSchema), authController.login)
//   .all(methodNotAllowed);
router
  .route("/login")
  .post(
    authLimiter,
    (req, res, next) => {
      console.log("[POST /login] Body:", req.body);
      next();
    },
    validateRequest(loginSchema),
    authController.login
  )
  .all(methodNotAllowed);
router
  .route("/accounts")
  .post(
    authLimiter,
    validateRequest(createAccountSchema),
    authController.register
  )
  .all(methodNotAllowed);

module.exports = router;
