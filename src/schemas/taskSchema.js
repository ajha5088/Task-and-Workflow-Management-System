const { gql } = require('apollo-server-express');

const taskSchema = gql`
  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    dueDate: String
    createdAt: String!
    updatedAt: String!
    assignedUsers: [ID!]!
    subtasks: [Subtask!]!
    dependencies: [Task!]!
    versionHistory: [TaskVersion!]!
    owner: ID!
    userRoles: [TaskUserRole!]!
  }

  type TaskVersion {
    version: Int!
    title: String!
    description: String
    status: String!
    dueDate: String
    updatedAt: String!
  }

  type TaskUserRole {
    userId: ID!
    role: String!
  }

  extend type Query {
    tasks(status: String, assignee: ID, dueDate: String): [Task!]!
    task(id: ID!): Task
    tasksAssignedToUser: [Task!]!
  }

  extend type Mutation {
    createTask(title: String!, description: String, dueDate: String): Task
    updateTask(id: ID!, title: String, description: String, status: String, dueDate: String): Task
    deleteTask(id: ID!): Boolean
    assignUserToTask(taskId: ID!, userId: ID!, role: String!): Task
    updateTaskStatus(id: ID!, status: String!): Task
    addTaskDependency(taskId: ID!, dependencyId: ID!): Task
  }
`;

module.exports = taskSchema;
