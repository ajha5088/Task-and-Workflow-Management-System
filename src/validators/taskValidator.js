const Joi = require('joi');

const taskValidators = {
  createTask: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    dueDate: Joi.date().optional(),
  }),
  updateTask: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
    dueDate: Joi.date().optional(),
  }),
};

module.exports = taskValidators;
