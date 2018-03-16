import { graphql, buildSchema } from 'graphql';

// Construct a schema using the GraphQL schema language
export const schema = buildSchema(`
  schema {
    query: Query
  }

  type Query {
    universities: [University]!
  }

  type University {
    id: Int!
    name: String!
    url: String
    color: String
    courses: [Course]
    location: String
  }

  type Course {
    id: Int!
    name: String!
    ucasCode: String!
  }
`);
