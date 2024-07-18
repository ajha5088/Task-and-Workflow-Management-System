const { gql } = require('apollo-server-express');

const subtaskSchema = gql`
  type Subtask {
    id: ID!
    parentTaskId: ID!
    title: String!
    description: String
    status: String!
    dueDate: String
    createdAt: String!
    updatedAt: String!
    assignedUsers: [ID!]!
    subtasks: [Subtask!]!
    versionHistory: [SubtaskVersion!]!
    userRoles: [SubtaskUserRole!]!
  }

  type SubtaskVersion {
    version: Int!
    title: String!
    description: String
    status: String!
    dueDate: String
    updatedAt: String!
  }

  type SubtaskUserRole {
    userId: ID!
    role: String!
  }


  extend type Mutation {
    createSubtask(parentTaskId: ID!, title: String!, description: String, dueDate: String): Subtask
    updateSubtask(id: ID!, title: String, description: String, status: String, dueDate: String): Subtask
    deleteSubtask(id: ID!): Boolean
    assignUserToSubtask(subtaskId: ID!, userId: ID!, role: String!): Subtask
    updateSubtaskStatus(id: ID!, status: String!): Subtask
    addSubtaskDependency(subtaskId: ID!, dependencyId: ID!): Subtask
  }
`;

module.exports = subtaskSchema;

/**
 *   extend type Query {
    subtasks(status: String, assignee: ID, dueDate: String): [Subtask!]!
    subtask(id: ID!): Subtask
  }
 */
