const { z } = require("zod");

const createMessageSchema = z.object({
  sender_id: z.number().int().positive(),
  receiver_id: z.number().int().positive(),
  content: z.string().min(1, "Message content is required"),
  task_id: z.number().int().positive(),
});

module.exports = {
  createMessageSchema,
};
