const ApiError = require("../api-error");
const JSend = require("../jsend");
const taskServices = require("../services/tasks.service");
const path = require("path");
const fs = require("fs");

exports.deleteAssignment = async (req, res, next) => {
  const { assignmentId } = req.params;

  try {
    const deleted = await taskServices.deleteTaskAttachment(assignmentId);

    if (!deleted) {
      throw new ApiError(404, "Contact not found");
    }

    return res.status(200).json(JSend.success({ message: "Contact deleted" }));
  } catch (error) {
    next(error);
  }
};

exports.uploadAssignment = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const file = req.file;

    if (!taskId || !file) {
      return res.status(400).json(JSend.fail("Missing required fields"));
    }

    const newAssignment = await taskServices.addTaskAttachment(taskId, file);

    return res.status(201).json(JSend.success({ data: newAssignment }));
  } catch (error) {
    next(error);
  }
};

exports.downloadAssignment = async (req, res, next) => {
  const { assignmentId } = req.params;

  try {
    const assignment = await taskServices.getTaskAttachmentById(assignmentId);

    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    const filePath = assignment.file_path; // adjust key based on your DB column
    const fullPath = path.resolve(filePath);

    if (!fs.existsSync(fullPath)) {
      throw new ApiError(404, "File not found on server");
    }

    res.download(fullPath, assignment.file_name); // or path.basename(fullPath)
  } catch (error) {
    next(error);
  }
};
