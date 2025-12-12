const { z } = require('zod');

const userSchema = z.object({
    username: z.string().min(3, 'Username phải ít nhất 3 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Password phải ít nhất 6 ký tự'),
    role: z.enum(['user', 'admin']).optional()
});

const partialUserSchema = userSchema.partial(); 

const userIdSchema = z.object({
    id: z.number().int().positive()
});

module.exports = {
    userSchema,
    partialUserSchema,
    userIdSchema
};
