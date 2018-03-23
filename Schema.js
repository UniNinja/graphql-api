//======================================== OLD SCHEMA

//import { graphql, buildSchema } from 'graphql';

//Construct a schema using the GraphQL schema language
//export const schema = buildSchema(`
//  schema {
//    query: Query
//  }

  // type Query {
  //   universities: [University]!
  // }

  // type University {
  //   id: Int!
  //   pubukprn: String!
  //   name: String!
  //   url: String
  //   color: String
  //   courses: [Course]
  //   location: String
  // }

  // type Course {
  //   id: Int!
  //   name: String!
  //   ucasCode: String!
  // }
//`);

// ======================================== NEW SCHEMA
//
// const graphql = require('graphql');
// //import {schema} from './Schema'
// import {
//   GraphQLList,
//   GraphQLObjectType,
//   GraphQLSchema,
//   GraphQLString
// } from 'graphql';
//
//
// require('dotenv').config()
// const util = require('util');
//
// // DATABASE SETUP
// var uri = process.env.MONGODB_URI;
// var database = null;
// var databaseErr = null;
// var MongoClient = require('mongodb').MongoClient;
//
// MongoClient.connect(uri, function(err, connection) {
//   console.log("Outside IF");
//   if (connection) {
//     console.log("CONNECTED TO: " + uri);
//     database = connection.db(process.env.MONGODB_DATABASE);
//   } else {
//     console.log("URI: " + uri);
//     console.log("DATABASE ERROR: " + err);
//     databaseErr = err;
//   }
// });
//
// // define the Todo type for graphql
// const UniversityType = new graphql.GraphQLObjectType({
//   fields: {
//     id: {
//       type: graphql.GraphQLInt
//     },
//     pubukprn: {
//       type: graphql.GraphQLString
//     },
//     name: {
//       type: graphql.GraphQLString
//     },
//     url: {
//       type: graphql.GraphQLString
//     },
//     color: {
//       type: graphql.GraphQLString
//     },
//     courses: {
//       type: graphql.GraphQLString //new GraphQLList(CourseType)
//     },
//     location: {
//       type: graphql.GraphQLString
//     }
//   }
// });
//
// const CourseType = new graphql.GraphQLObjectType({
//   fields: {
//     id: {
//       type: graphql.GraphQLInt
//     },
//     name: {
//       type: graphql.GraphQLString
//     },
//     ucasCode: {
//       type: graphql.GraphQLString
//     }
//   }
// });
//
// // define the queries of the graphql Schema
// const query = new graphql.GraphQLObjectType({
//   fields: {
//     universities: {
//       type: new graphql.GraphQLList(UniversityType),
//       args: {
//         name: {
//           type: graphql.GraphQLString
//         }
//       },
//
//       resolve: (_, {name}) => {
//         if (name) {
//
//           database.collection("uni").find().toArray(function(err, dbRes) {
//             if (err) {
//               console.log("Error");
//               console.log(dbRes);
//               return {universities: []};
//
//             } else {
//               return {universities: dbRes};
//             }
//           });
//
//         } else {
//           return "ISSUE WITH SCHEME, :( ";
//         }
//       }
//     }
//   }
// });
//
//
//
// // creates and exports the GraphQL Schema
// export const schema = new graphql.GraphQLSchema({query});
