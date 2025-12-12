const express = require("express");
const router = express.Router();

const messagesController = require("../controllers/messages.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");
const { validateRequest } = require("../middlewares/validator.middleware");
const { createMessageSchema } = require("../schemas/messages.schemas");

// GET all messages (optional, or filtered by task_id)
router
  .route("/")
  .get(messagesController.getMessages) // optional: support query like ?task_id=123
  .all(methodNotAllowed);

// POST a new message
router
  .route("/send")
  .post(validateRequest(createMessageSchema), messagesController.sendMessage)
  .all(methodNotAllowed);

module.exports = router;
