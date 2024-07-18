const Joi = require('joi');

const subtaskValidators = {
  createSubtask: Joi.object({
    parentTaskId: Joi.string().required(),
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    dueDate: Joi.date().optional(),
  }),
  updateSubtask: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
    dueDate: Joi.date().optional(),
  }),
};

module.exports = subtaskValidators;
