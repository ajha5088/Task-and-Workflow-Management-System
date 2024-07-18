const CustomError = require('../errors/customError');

const errorHandler = (error, message, status = 500) => {
  if (error instanceof CustomError) {
    throw error;
  }
  throw new CustomError(status, message);
};

module.exports = errorHandler;
