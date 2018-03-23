// import {schema} from './Schema'
//
// //http://LMNL0GP6R3WGTPC4BPNC:password@data.unistats.ac.uk/api/v4/KIS/Institution/10007806/Courses.json?pageSize=300
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
//   if (connection) {
//     database = connection.db(process.env.MONGODB_DATABASE);
//   } else {
//     databaseErr = err;
//   }
// });
//
// const resolvers = {
//   Query: {
//     universities(root, args) {
//
//       database.collection("uni").find().toArray(function(err, dbRes) {
//         if (err) {
//           console.log("Error");
//           console.log(dbRes);
//           return {universities: []};
//
//         } else {
//           return {universities: dbRes};
//         }
//       }
//     }
//   }
// };
//
// export default resolvers;
