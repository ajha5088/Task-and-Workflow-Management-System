const CustomError = require('../errors/customError');
const validators = require('../../validators');

const validateRequest = (schemaKey, data) => {
  const [domain, operation] = schemaKey.split('.');
  const schema = validators[`${domain}Validators`][operation];
  if (!schema) {
    throw new CustomError(500, `No validation schema found for ${schemaKey}`);
  }
  
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new CustomError(400, `Validation error: ${error.details.map((x) => x.message).join(', ')}`);
  }
};

module.exports = validateRequest;
