const ApiError = require("../api-error");
const JSend = require("../jsend");
const messageServices = require("../services/messages.service");

exports.getMessages = async (req, res, next) => {
  try {
    const { task_id } = req.query;
    const messages = await messageServices.fetchMessages(task_id);

    if (!messages.length) throw new ApiError(404, "No messages found");

    return res.status(200).json(JSend.success(messages));
  } catch (error) {
    next(error);
  }
};
exports.sendMessage = async (req, res, next) => {
  try {
    const newMessage = await messageServices.createMessage(req.body);

    return res.status(201).json(JSend.success(newMessage));
  } catch (error) {
    next(error);
  }
};
