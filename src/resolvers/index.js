const userResolvers = require('./userResolver');
const taskResolvers = require('./taskResolver');
const subtaskResolvers = require('./subTaskResolver');

module.exports = [userResolvers, taskResolvers, subtaskResolvers];
