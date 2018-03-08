import { makeExecutableSchema } from 'graphql-tools';

// Construct a schema using the GraphQL schema language
const typeDefs =
  type University {
    id: Int!
    name: String!
    url: String
    color: String
  };
