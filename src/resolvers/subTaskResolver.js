const Subtask = require("../models/subTaskModel");
const Task = require("../models/taskModel");
const CustomError = require("../utils/errors/customError");
const handleError = require("../utils/handlers/errorHandler");
const handleSuccess = require("../utils/handlers/successHandler");
const { authorize } = require("../utils/middlewares/rbacAuthentication");;
const { createTaskVersion } = require("../utils/helpers/versionControlHelper");
const appLogger = require("../config/appLogger");

const subtaskResolvers = {

  Mutation: {
    createSubtask: async (
      _,
      { parentTaskId, title, description, dueDate },
      { user }
    ) => {
      try {
        appLogger.info("resolver - subTaskResolver - createSubtask - start ");

        authorize(["admin", "project_manager", "team_lead"])(user);

        const parentTask = await Task.findById(parentTaskId);
        if (!parentTask) throw new CustomError(404, "Parent task not found");

        const subtask = new Subtask({
          parentTaskId,
          title,
          description,
          status: "To Do",
          dueDate,
          assignedUsers: [user._id],
        });

        let versionParams = {
          taskId: parentTaskId,
          subTaskId : subtask._id,
          title: "subtask created",
          status: parentTask.status,
          updatedBy: user.id,
        };

        let versionRespone = await createTaskVersion(versionParams);
        parentTask.versionHistory.push(versionRespone);
        await parentTask.save();
    
        const savedSubtask = await subtask.save();
        parentTask.subtasks.push(savedSubtask._id);
        await parentTask.save();

        appLogger.info("resolver - subTaskResolver - createSubtask - end ");
        return handleSuccess(savedSubtask , "subTask created successfully.");
      } catch (error) {
        appLogger.error("resolver - subTaskResolver - createSubtask - error ");
        appLogger.error(error.message);
        handleError("Error creating subtask" ,error.message );
      }
    },
    updateSubtask: async (
      _,
      { id, title, description, status, dueDate },
      { user }
    ) => {
      try {
        appLogger.info("resolver - subTaskResolver - updateSubtask - start ");

        authorize(["admin", "project_manager", "team_lead", "team_member"])(user);

        const subTask = await Subtask.findById(id);
        if (!subTask) throw new CustomError(404, "sub task not found");

        if (title) subTask.title = title;
        if (description) subTask.description = description;
        if (status) subTask.status = status;

        if (dueDate) subTask.dueDate = dueDate;
        subTask.updatedAt = new Date();

        const updatedSubtask = await subTask.save();
        appLogger.info("resolver - subTaskResolver - updateSubtask - end ");
        return updatedSubtask;
      } catch (error) {
        appLogger.error("resolver - subTaskResolver - createSubtask - error ");
        appLogger.error(error.message);
        handleError("Error updating subtask" ,error.message );
      }
    },
    deleteSubtask: async (_, { id }, { user }) => {
      try {
        appLogger.info("resolver - subTaskResolver - deleteSubtask - error ");
        const subTask = await Subtask.findById(id);
        if (!subTask) throw new CustomError(404, "sub task not found");

        if (!subTask.userRoles)
          throw new CustomError(403, "No roles found for this subtask");

        // Authorization check for deleting a subtask
        authorize(["admin", "project_manager", "team_lead"], "delete")(
          user,
          subTask.userRoles
        );

        await Subtask.findByIdAndDelete(id);
        appLogger.info("resolver - subTaskResolver - deleteSubtask - end ");
        return true;
      } catch (error) {
        appLogger.error("resolver - subTaskResolver - deleteSubtask - error ");
        appLogger.error(error.message);
        handleError("Error deleting subtask" ,error.message );
      }
    },
    assignUserToSubtask: async (_, { subtaskId, userId }, { user }) => {
      try {
        appLogger.info("resolver - subTaskResolver - deleteSubtask - start ");

        const subTask = await Subtask.findById(subtaskId);
        if (!subTask) throw new CustomError(404, "Subtask not found");
        
        authorize(["admin", "project_manager", "team_lead" , "team_member"])(user);

        if (!subTask.assignedUsers.includes(userId)) {
          subTask.assignedUsers.push(userId);
        }

        const updatedSubtask = await subTask.save();
        appLogger.info("resolver - subTaskResolver - deleteSubtask - end ");
        return updatedSubtask;
      } catch (error) {
        appLogger.error("resolver - subTaskResolver - assignUserToSubtask - error ");
        appLogger.error(error.message);
        handleError("Error assign User To Subtask " ,error.message );
      }
    },
    updateSubtaskStatus: async (_, { id, status }, { user }) => {
      try {
        appLogger.info("resolver - subTaskResolver - updateSubtaskStatus - start ");
        const subtask = await Subtask.findById(id);
        if (!subtask) throw new CustomError(404, "Subtask not found");
        authorize(
          ["admin", "project_manager", "team_lead", "team_member"],
        )(user);

        subtask.status = status;

        const updatedSubtask = await subtask.save();
        appLogger.info("resolver - subTaskResolver - updateSubtaskStatus - end ");
        return updatedSubtask;
      } catch (error) {
        appLogger.error("resolver - subTaskResolver - updateSubtaskStatus - error ");
        appLogger.error(error.message);
        handleError("Error updating subtask Subtask " ,error.message );
      }
    },
  },
};

module.exports = subtaskResolvers;
