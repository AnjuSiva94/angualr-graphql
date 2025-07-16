const { gql } = require('graphql-tag');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    active: Boolean
  }

  type Query {
    users: [User] 
    user(id: ID!): User
    searchUser(name: String!): User
    searchUsersByDomain(domain: String!): [User] 
    userCount: Int
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id:ID!, name: String!, email: String!): User
    deleteUser(id:ID!): Boolean
    toggleUserStatus(id:ID!): User
     deactivateAllUsers:Boolean
  }
`;

module.exports = typeDefs;
