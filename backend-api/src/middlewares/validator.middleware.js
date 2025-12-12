const { z } = require("zod");
const ApiError = require("../api-error");

/**
 * Validates the request object using the provided Zod validator.
 * Supports validation from params, query, body, and file.
 *
 * @param {z.AnyZodObject} validator - The Zod schema to validate against.
 * @returns {Function} Express middleware.
 */
function validateRequest(validator) {
  return (req, res, next) => {
    try {
      console.log("🧪 Validating request with schema:", validator);

      let input = { ...req.params }; // Always start with params
      console.log("📦 Params:", req.params);

      // Include query data for GET and DELETE
      if (req.method === "GET" || req.method === "DELETE") {
        input = { ...input, ...req.query };
        console.log("📨 Query:", req.query);
      }

      // Include body and file data for POST/PUT/PATCH
      if (
        req.method === "POST" ||
        req.method === "PUT" ||
        req.method === "PATCH"
      ) {
        console.log("🧾 Body:", req.body);
        input = {
          ...input,
          ...(req.body ?? {}),
          ...(req.file ?? {}),
        };
      }

      console.log("✅ Input before validation:", input);

      // Perform validation
      validator.parse(input);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const errorPath = issue.path.join(".");
          if (issue.code === z.ZodIssueCode.unrecognized_keys) {
            const invalidKeys = issue.keys.join(", ");
            return `${errorPath} contains invalid keys: ${invalidKeys}`;
          }
          return `${errorPath}: ${issue.message}`;
        });
        return next(new ApiError(400, errorMessages.join("; ")));
      }

      console.error("❌ Unexpected validation error:", error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  };
}

module.exports = {
  validateRequest,
};
