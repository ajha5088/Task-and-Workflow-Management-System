const { gql } = require('apollo-server-express');

const userSchema = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    role: [String!]!
  }

  extend type Query {
    users: [User!]!
    user(id: ID!): User
  }

  extend type Mutation {
    createUser(username: String!, email: String!, password: String!): User
    login(email: String!, password: String!): AuthPayload!
  }

  type AuthPayload {
    user: User!
    accessToken: String!
  }
`;

module.exports = userSchema;
