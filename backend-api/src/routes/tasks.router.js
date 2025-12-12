const express = require("express");
const router = express.Router();
const taskController = require("../controllers/tasks.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");
const {
  authenticateToken,
  isAdmin,
} = require("../middlewares/auth.middleware");
const { validateRequest } = require('../middlewares/validator.middleware');
const { taskSchema, updateTaskSchema } = require('../schemas/task.schemas');

router
  .route("/")
  .get(authenticateToken, taskController.getTasks)
  .post(authenticateToken, isAdmin, validateRequest(taskSchema), taskController.createTask)
  .all(methodNotAllowed);

router
  .route("/:taskId")
  .patch(authenticateToken, isAdmin, validateRequest(updateTaskSchema), taskController.updateTask)
  .delete(authenticateToken, isAdmin, taskController.deleteTask)
  .all(methodNotAllowed);

module.exports = router;
