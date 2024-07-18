const { gql } = require('apollo-server-express');
const userSchema = require('./userSchema');
const taskSchema = require('./taskSchema');
const subtaskSchema = require('./subTaskSchema');

const baseSchema = gql`
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

module.exports = [baseSchema, userSchema, taskSchema, subtaskSchema];
