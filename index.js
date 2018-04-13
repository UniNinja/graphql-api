require('dotenv').config();
import fetch from 'node-fetch';
const util = require('util');

// DATABASE SETUP
var uri = "mongodb://" + process.env.MONGODB_USERNAME + ":" + process.env.MONGODB_PASSWORD + "@unininja-cluster-shard-00-00-d1bwx.mongodb.net:27017," + "unininja-cluster-shard-00-01-d1bwx.mongodb.net:27017," + "unininja-cluster-shard-00-02-d1bwx.mongodb.net:27017" + "/uni?ssl=true&replicaSet=unininja-cluster-shard-0&authSource=admin";

var database = null;
var databaseErr = null;
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(uri, function(err, connection) {
  if (connection) {
    database = connection.db(process.env.MONGODB_DATABASE);
  } else {
    databaseErr = err;
  }
});

// GRAPHQL SETUP

const {readFileSync} = require("fs");
const bodyParser = require("body-parser");
const {graphqlExpress, graphiqlExpress} = require("apollo-server-express");
const {makeExecutableSchema} = require("graphql-tools");

const express = require('express');
const graphqlHTTP = require('express-graphql');
const graphql = require('graphql');
const app = express();

const schema = makeExecutableSchema({
  typeDefs: readFileSync("schema.graphql", "utf8"),
  resolvers: {
    Query: {
      universities: () => getUniversities(),
      courses: () => getCourses()
    }
  }
});

function getCourses() {
  const promise = fetch('http://unistats.ac.uk/api/v4/KIS/Institution/10007806/Courses.json', {
    headers: {
      'Authorization': 'Basic TE1OTDBHUDZSM1dHVFBDNEJQTkM6cGFzc3dvcmQK'
    }
  }).then(res => {
    console.log(res);
    return res.json();
  }).catch(err => console.log(err));

  return promise;
}

function getUniversities() {

  fetch('https://data.unistats.ac.uk/api/v4/KIS/Institutions.json?pageSize=1000', {
    headers: {
      'Authorization': 'Basic TE1OTDBHUDZSM1dHVFBDNEJQTkM6cGFzc3dvcmQK'
    }
  }).then(function(response) {
    return response.json();
  }).then(function(myJson) {
    var myUniList = myJson;
    var expr = /university/;
    for (var i = 0; i < myUniList.length; i++) {
      //console.log("IN FOR LOOP: " + i);
      if (!(myUniList[i].Name.toLowerCase().includes("university"))) {
        console.log("ITEM DELETED: " + myUniList[i].Name.toLowerCase());
        myUniList.splice(i, 1);
      } else if(!(expr.test(myUniList[i].Name.toLowerCase()))){
           console.log("ITEM DELETED 2: " + myUniList[i].Name.toLowerCase());
           myUniList.splice(i, 1);
      }

      // IF WE NEED TO REPLACE THINGS ETC.
      // }else {
      //   var tempStr;
      //   tempStr = JSON.stringify(myUniList[i]);
      //   tempStr = tempStr.replace(/\"Name\":/g, "\"name\":");
      //   myUniList[i] = JSON.parse(tempStr);
      // }
    }

    console.log(myUniList);
    console.log(myUniList.length);
    return myUniList;
  });
}

// function getUniversities() {
//   const promise = database.collection("uni").find().toArray().then(obj => obj).catch(err => console.log(err));
//   return promise;
// }

app.use('/v0', graphqlHTTP({schema, graphiql: true}));

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
