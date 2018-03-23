//import {schema} from './Schema'
//import {resolver} from './resolvers'

//http://LMNL0GP6R3WGTPC4BPNC:password@data.unistats.ac.uk/api/v4/KIS/Institution/10007806/Courses.json?pageSize=300

require('dotenv').config();
import fetch from 'node-fetch';
const util = require('util');

// DATABASE SETUP
var uri = process.env.MONGODB_URI;
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
  //console.log("Hi Dan");
  const promise = fetch('http://unistats.ac.uk/api/v4/KIS/Institution/10007806/Courses.json', {
    headers: {
      'Authorization': 'Basic TE1OTDBHUDZSM1dHVFBDNEJQTkM6cGFzc3dvcmQK'
    }
  }
).then(res => {
  console.log(res);
  return res.json();
}).catch(err => console.log(err));

  return promise;
}

function getUniversities() {
  const promise = database.collection("uni").find().toArray().then(obj => obj).catch(err => console.log(err));
  return promise;
}

app.use('/v0', graphqlHTTP({schema, graphiql: true}));

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
