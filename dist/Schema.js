'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schema = undefined;

var _graphql = require('graphql');

// Construct a schema using the GraphQL schema language
var schema = exports.schema = (0, _graphql.buildSchema)('\n  schema {\n    query: Query\n  }\n\n  type Query {\n    universities: [University]!\n  }\n\n  type University {\n    id: Int!\n    name: String!\n    url: String\n    color: String\n    courses: [Course]\n    location: String\n  }\n\n  type Course {\n    id: Int!\n    name: String!\n    ucasCode: String!\n  }\n');