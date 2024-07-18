const handleSuccess = (data, message = "Operation successful", statusCode = 200) => {
  // Directly return data if it's used in a GraphQL resolver
  if (typeof data === 'object' && data._id) {
    return data;
  }

  return {
    success: true,
    message,
    statusCode,
    data,
  };
};

module.exports = handleSuccess;
