const Joi = require('joi');

const userValidators = {
  createUser: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

module.exports = userValidators;
