const { z } = require('zod');

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const createItemSchema = z
  .object({
    name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
    description: z.string().trim().max(MAX_DESCRIPTION_LENGTH).optional().default(''),
  })
  .strict();

const updateItemSchema = createItemSchema.partial().refine((body) => Object.keys(body).length > 0, {
  message: 'At least one field is required',
});

const idParamSchema = z.object({ id: z.string().uuid() });

module.exports = { createItemSchema, updateItemSchema, idParamSchema };
