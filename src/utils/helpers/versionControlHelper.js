const TaskVersion = require("../../models/taskVersionModel");
const CustomError = require("../errors/customError");

const createTaskVersion = async (params) => {
  if (!params)
    throw new CustomError(400, "Task is required to create a version");

  const taskVersion = new TaskVersion({
    taskId: params.taskId,
    subTaskId: params.subTaskId,
    title: params.title,
    assignedUser: params.assignedUser,
    status: params.status,
    dueDate: params.dueDate,
    dependecyId: params.dependecyId,
    updatedBy: params.updatedBy,
    updatedAt: new Date(),
  });

  await taskVersion.save();
  return taskVersion._id;
};

const deleteTaskVersion = async (id) => {
  if (!id) throw new CustomError(400, "Task id is required to delete version");

  await TaskVersion.deleteMany({ taskId: id });
  return;
};

module.exports = {
  createTaskVersion,
  deleteTaskVersion,
};
