const express = require("express");
const assignmentController = require("../controllers/assignment.controller");
const upload = require("../middlewares/multer.middleware");
const { uploadLimiter } = require("../middlewares/rate-limit.middleware");

const router = express.Router();

router.post("/", uploadLimiter, upload.single("file"), assignmentController.uploadAssignment);
router.delete("/:assignmentId", assignmentController.deleteAssignment);
router.get("/download/:assignmentId", assignmentController.downloadAssignment);
module.exports = router;
