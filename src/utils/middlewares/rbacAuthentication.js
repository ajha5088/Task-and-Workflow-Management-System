const CustomError = require('../errors/customError');


const authorize = (allowedRoles) => (user) => {

  if (!user || !user._id) {
    throw new CustomError(401, 'Unauthorized access');
  }
  
  const userRole = user.role;
  if (!allowedRoles.includes(userRole)) {
    throw new CustomError(403, 'You do not have permission to perform this action');
  }
};

const checkTeamLeadAccess = (user) => {

}

module.exports = {
  authorize,
};
