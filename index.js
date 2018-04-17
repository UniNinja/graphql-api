require('dotenv').config();
import fetch from 'node-fetch';
const util = require('util');

// DATABASE SETUP
var uri = "mongodb://"
            + process.env.MONGODB_USERNAME + ":"
            + process.env.MONGODB_PASSWORD
            + "@unininja-cluster-shard-00-00-d1bwx.mongodb.net:27017,"
            + "unininja-cluster-shard-00-01-d1bwx.mongodb.net:27017,"
            + "unininja-cluster-shard-00-02-d1bwx.mongodb.net:27017"
            + "/uni?ssl=true&replicaSet=unininja-cluster-shard-0&authSource=admin";

// GRAPHQL SETUP

const {readFileSync} = require("fs");
const bodyParser = require("body-parser");
const {graphqlExpress, graphiqlExpress} = require("apollo-server-express");
const {makeExecutableSchema} = require("graphql-tools");

const express = require('express');
const graphqlHTTP = require('express-graphql');
const graphql = require('graphql');
const app = express();
const MongoClient = require('mongodb').MongoClient;

let database = null;

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
      'Authorization': `Basic ${process.env.UNISTATS_AUTH}`
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

const send401Unauthorized = (res) => {
  res
    .status(401)
    .set("WWW-Authenticate", "Basic realm=\"UniNinja API\"")
    .send({
      "errors": [
        {
          "message": "You must be authorised to use the UniNinja API."
        }
      ]
    });
}

const send503ServerError = (res, msg) => {
  const message = msg ? msg : "An internal server error occurred whilst using the UniNinja API. Please try again later."
  res
    .status(503)
    .send({
      "errors": [
        {
          "message": message
        }
      ]
    });
}

app.use((req, res, next) => {
  console.log("Connection initiated")
  MongoClient.connect(uri).then(connection => {
    console.log("Connection succeeded")
    database = connection.db(process.env.MONGODB_DATABASE);
    next();
  }).catch(err => {
    console.log("Connection failed")
    send503ServerError(res, msg);
  })
});

app.use((req, res, next) => {
  const authHeader = req.get('Authorization');
  if(authHeader) {
    const apiKey = Buffer.from(authHeader.substring(6), 'base64').toString().split(":", 1)[0];
    console.log("Db before", database)
    database.collection('keys').find({key: apiKey}).toArray(function(err, result) {
      if(err){
        send503ServerError(res);
      } else {
        if(result.length > 0) {
          next();
        } else {
          send401send401Unauthorized(res);
        }
      }
    });
    console.log("Db after", database)
  } else {
    send401Unauthorized(res);
  }
});

app.use('/v0', graphqlHTTP({schema, graphiql: true}));

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
