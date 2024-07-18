const Task = require('../../models/taskModel');
const CustomError = require('../errors/customError');

const checkDependencies = async (req, res, next) => {
  const { id } = req.params;

  const task = await Task.findById(id).populate('dependencies');
  if (!task) {
    return next(new CustomError(404, 'Task not found'));
  }

  const incompleteDependencies = task.dependencies.filter(dependency => dependency.status !== 'Done');
  if (incompleteDependencies.length > 0) {
    return next(new CustomError(400, 'Task cannot be started until all dependencies are completed'));
  }

  next();
};

module.exports = checkDependencies;
