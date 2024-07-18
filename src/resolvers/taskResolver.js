const Task = require("../models/taskModel");
const CustomError = require("../utils/errors/customError");
const {
  createTaskVersion,
  deleteTaskVersion,
} = require("../utils/helpers/versionControlHelper");
const handleError = require("../utils/handlers/errorHandler");
const handleSuccess = require("../utils/handlers/successHandler");
const { authorize } = require("../utils/middlewares/rbacAuthentication");
const checkDependencies = require("../utils/middlewares/checkDependencies");
const appLogger = require("../config/appLogger");

const taskResolvers = {
  Query: {
    tasks: async (_, { status, assignee, dueDate }, { user }) => {
      try {
        appLogger.info("resolver - taskResolver - tasks - start ");

        authorize(["admin", "project_manager", "team_lead", "team_member"])(
          user
        );

        const filter = {};
        if (status) filter.status = status;
        if (assignee) filter.assignedUsers = assignee;
        if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };

        if (user.role === "admin" || user.role === "project_manager") {
          const tasks = await Task.find(filter)
            .populate("assignedUsers")
            .populate("subtasks")
            .populate("dependencies");
          appLogger.info("resolver - taskResolver - tasks - end ");
          return tasks;
        } else if (user.role === "team_lead" || user.role === "team_member") {
          filter.assignedUsers = user._id;
          const tasks = await Task.find(filter)
            .populate("assignedUsers")
            .populate("subtasks")
            .populate("dependencies");
          appLogger.info("resolver - taskResolver - tasks - end");
          return tasks;
        }
      } catch (error) {
        appLogger.error("resolver - taskResolver - tasks - error ");
        appLogger.error(error.message);
        handleError("Error fetching tasks", error.message);
      }
    },
    task: async (_, { id }, { user }) => {
      try {
        appLogger.info("resolver - taskResolver - task - start ");

        const task = await Task.findById(id).populate("subtasks");
        if (!task) throw new CustomError(404, "Task not found");

        if (!task.userRoles)
          throw new CustomError(403, "No roles found for this task");

        authorize(
          ["admin", "project_manager", "team_lead", "team_member"],
          "read"
        )(user, task.userRoles);
        appLogger.info("resolver - taskResolver - task - end ");
        return task;
      } catch (error) {
        appLogger.error("resolver - taskResolver - task - error ");
        appLogger.error(error.message);
        handleError("Error fetching a task", error.message);
      }
    },
    tasksAssignedToUser: async (_, {}, { user }) => {
      try {
        appLogger.info("resolver - taskResolver - tasksAssignedToUser - start");
        authorize(["admin", "project_manager", "team_lead", "team_member"])(
          user
        );

        const tasks = await Task.find({ assignedUsers: user._id }).populate(
          "assignedUsers"
        );
        appLogger.info("resolver - taskResolver - tasksAssignedToUser - end");
        return tasks;
      } catch (error) {
        appLogger.error(
          "resolver - taskResolver - tasksAssignedToUser - error "
        );
        appLogger.error(error.message);
        handleError("Error fetching tasks assigned to user'", error.message);
      }
    },
  },
  Mutation: {
    createTask: async (_, { title, description, dueDate }, { user }) => {
      try {
        appLogger.info("resolver - taskResolver - createTask - start ");

        authorize(["admin", "project_manager"])(user);

        const task = new Task({
          title,
          description,
          status: "To Do",
          dueDate,
          owner: user._id,
          assignedUsers: [user._id],
        });

        const savedTask = await task.save();
        appLogger.info("resolver - taskResolver - createTask - end ");

        return handleSuccess(savedTask, "task created successfully");
      } catch (error) {
        appLogger.error("resolver - taskResolver - createTask - error ");
        appLogger.error(error.message);
        handleError("Error creating task", error.message);
      }
    },
    updateTask: async (
      _,
      { id, title, description, status, dueDate },
      { user }
    ) => {
      try {
        appLogger.info("resolver - taskResolver - updateTask - start ");

        authorize(["admin", "project_manager", "team_lead"])(user);

        const task = await Task.findById(id);
        if (!task) throw new CustomError(404, "Task not found");

        let versionParams = {
          taskId: task._id,
          title: "task updated",
          status: status ? status : task.status,
          dueDate: dueDate ? dueDate : task.dueDate,
          updatedBy: user.id,
        };

        let versionResponse = await createTaskVersion(versionParams);

        if (title) task.title = title;
        if (description) task.description = description;
        if (status) {
          if (status === "In Progress") {
            const req = { params: { id } };
            const res = {};
            await checkDependencies(req, res, () => {});
          }
          task.status = status;
        }
        if (dueDate) task.dueDate = dueDate;
        task.versionHistory.push(versionResponse);
        task.updatedAt = new Date();

        const updatedTask = await task.save();
        appLogger.info("resolver - taskResolver - updateTask - end ");
        return handleSuccess(updatedTask, "task updated successfully");
      } catch (error) {
        appLogger.error("resolver - taskResolver - updateTask - error ");
        appLogger.error(error.message);
        handleError("Error updating task", error.message);
      }
    },
    deleteTask: async (_, { id }, { user }) => {
      try {
        appLogger.info("resolver - taskResolver - deleteTask - start ");
        authorize(["admin"])(user);

        const task = await Task.findById(id);
        if (!task) throw new CustomError(404, "Task not found");

        if (task.status) {
          if (task.status === "In Progress") {
            const req = { params: { id } };
            const res = {};
            await checkDependencies(req, res, () => {});
          }
        }

        await deleteTaskVersion(id);

        await Task.findByIdAndDelete(id);
        appLogger.info("resolver - taskResolver - deleteTask - end ");
        return handleSuccess(true, "task deleted succeessfully.");
      } catch (error) {
        appLogger.error("resolver - taskResolver - deleteTask - error ");
        appLogger.error(error.message);
        handleError("Error deleting task", error.message);
      }
    },
    assignUserToTask: async (_, { taskId, userId }, { user }) => {
      try {
        appLogger.error("resolver - taskResolver - assignUserToTask - start ");

        const task = await Task.findById(taskId);
        if (!task) throw new CustomError(404, "Task not found");

        authorize(["admin", "project_manager", "team_lead"])(user);

        let versionParams = {
          taskId: task._id,
          title: "user assigned to task",
          assignedUser: userId,
          status: task.status,
          dueDate: task.dueDate,
          updatedBy: user.id,
        };

        let versionResponse = await createTaskVersion(versionParams);

        task.userRoles.push({ userId, role });
        if (!task.assignedUsers.includes(userId)) {
          task.assignedUsers.push(userId);
          task.versionHistory.push(versionResponse);
        }
        const updatedTask = await task.save();
        appLogger.error("resolver - taskResolver - assignUserToTask - end ");
        return updatedTask;
      } catch (error) {
        appLogger.error("resolver - taskResolver - assignUserToTask - error ");
        appLogger.error(error.message);
        handleError("Error assigning user to task", error.message);
      }
    },
    updateTaskStatus: async (_, { id, status }, { user }) => {
      try {
        appLogger.info("resolver - taskResolver - updateTaskStatus - start ");

        authorize(["admin", "project_manager", "team_lead", "team_member"])(
          user
        );

        const task = await Task.findById(id);
        if (!task) throw new CustomError(404, "Task not found");

        let versionParams = {
          taskId: task._id,
          title: "task status updated",
          status: status,
          dueDate: task.dueDate,
          updatedBy: user.id,
        };

        let versionResponse = await createTaskVersion(versionParams);

        if (task.status) {
          if (status === "In Progress") {
            const req = { params: { id } };
            const res = {};
            await checkDependencies(req, res, () => {});
          }
        }

        task.status = status;
        task.versionHistory.push(versionResponse);
        const updatedTask = await task.save();
        appLogger.info("resolver - taskResolver - updateTaskStatus - end ");
        return handleSuccess(updatedTask, "task status updated successfully.");
      } catch (error) {
        appLogger.error("resolver - taskResolver - updateTaskStatus - error ");
        appLogger.error(error.message);
        handleError("Error updating task status", error.message);
      }
    },
    addTaskDependency: async (_, { taskId, dependencyId }, { user }) => {
      try {
        appLogger.info("resolver - taskResolver - addTaskDependency - start ");
        const task = await Task.findById(taskId);
        if (!task) throw new CustomError(404, "Task not found");

        authorize(["admin", "project_manager", "team_lead"])(user);

        if (!task.dependencies.includes(dependencyId)) {
          task.dependencies.push(dependencyId);

          let versionParams = {
            taskId: task._id,
            title: "task dependency added",
            dependencyId,
            status: task.status,
            dueDate: task.dueDate,
            updatedBy: user.id,
          };

          let versionResponse = await createTaskVersion(versionParams);
          task.versionHistory.push(versionResponse);
        }
        const updatedTask = await task.save();
        appLogger.info("resolver - taskResolver - addTaskDependency - end ");
        return updatedTask;
      } catch (error) {
        appLogger.error("resolver - taskResolver - addTaskDependency - error ");
        appLogger.error(error.message);
        handleError("Error adding Task Dependency", error.message);
      }
    },
  },
};

module.exports = taskResolvers;
