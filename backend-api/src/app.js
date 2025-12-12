const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const fs = require("fs");
const { apiLimiter } = require("./middlewares/rate-limit.middleware");

const app = express();

const openApiSpec = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../docs/openapiSpec.json"), "utf-8")
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.get("/", (req, res) => {
  return res.json({
    message: "Task Management API is running",
  });
});

app.use("/assignments", require("./routes/assignments.router"));
app.use("/auth", require("./routes/auth.router"));
app.use("/users", require("./routes/users.router"));
app.use("/tasks", require("./routes/tasks.router"));
app.use("/messages", require("./routes/messages.router"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

const {
  resourceNotFound,
  handleError,
} = require("./controllers/errors.controller");
app.use(resourceNotFound);
app.use(handleError);

module.exports = app;
