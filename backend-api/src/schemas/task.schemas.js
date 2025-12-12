const { z } = require('zod');

const taskSchema = z.object({
    taskId: z.string().optional(),
    title: z.string().min(1).max(255),
    description: z.string().min(1).max(255),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // fix format
    assignedTo: z.string().regex(/^\d+$/).optional(), // bảo đảm là số
    status: z.enum(['pending', 'in-progress', 'completed']).optional(),
    file: z.any().optional().nullable() // nếu có file upload
});

const updateTaskSchema = taskSchema.partial().extend({
    taskId: z.string()
});

module.exports = {
    taskSchema,
    updateTaskSchema
};
