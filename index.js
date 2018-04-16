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
      courseList: () => getCourses(),
      course: (obj, args, context) => getCourseInfo(args.pubukprn, args.kiscourseid)
        // const promise = getCourseInfo();
        //
        //  do shit here
        // console.log("Promise Return: " +  promise);
        //
        // return promise;
      // WORKING EXAMPLE
      // var returnJson = {};
      // returnJson.title = "LOIC";
      // return {title: "LOIC"};
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

function getCourseInfo(pubukprn, kiscourseid) {

  //Using sussexMComp as a default;
  // Sussex pubukprn = 10007806
  // Computer Science MComp = 37310

  return fetch("http://data.unistats.ac.uk/api/v4/KIS/Institution/" + pubukprn + "/Course/" + kiscourseid + "/FullTime.json", {
    headers: {
      'Authorization': 'Basic TE1OTDBHUDZSM1dHVFBDNEJQTkM6cGFzc3dvcmQK'
    }
  }).then(function(response) {
    // returns the succeeded promise to the next .then()
    return response.json();

  }).then(function(myJson) {
    return new Promise((resolve, reject) => {
      var placement = false;
      var yearAbroad = false;
      var hons = false;

      if (myJson.SandwichAvailable > 0) {
        placement = true;
      }
      if (myJson.YearAbroadAvaliable > 0) {
        yearAbroad = true;
      }

      console.log("COURSE INFO:     " + myJson.Title);

      // CREATE JSON TO RETURN;
      var returnJson = {};

      returnJson.title = myJson.Title + " " + myJson.KisAimLabel;
      returnJson.courseURL = myJson.CoursePageUrl;
      returnJson.years = myJson.LengthInYears;
      returnJson.placementYearAvaliable = placement;
      returnJson.yearAbroadAvaliable = yearAbroad;
      returnJson.degreeLabel = myJson.KisAimLabel;
      returnJson.isHons = myJson.Honours;

      console.log(JSON.stringify(returnJson));

      if (returnJson) {
        console.log("JSON RETURNED?:  YES");
        resolve(returnJson);
      } else {
        console.log("JSON RETURNED?:  NO :(");
        reject("Something went wrong but the promise flagged it up");
      }

    });
  })
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
      } else if (!(expr.test(myUniList[i].Name.toLowerCase()))) {
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
