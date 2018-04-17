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
      // The querys that are avaliable to the client side.
      university: (obj, args, context) => getUniversity(args.pubukprn),
      universities: () => getUniversities(),
      courseList: (obj, args, context) => getCourses(args.pubukprn),
      course: (obj, args, context) => getCourseInfo(args.pubukprn, args.kiscourseid)
    },
    University: {
      // Adds the courses for a university as per the schema.
      courses: (obj, args, context) => getCourses(obj.pubukprn),
    }
  }
});


/**
  * Returns a list of all universities with their Name & pubukprn.
  * @return {Object}  promise - The json list of all universities.
  */
function getUniversities() {

  const promise = fetch('https://data.unistats.ac.uk/api/v4/KIS/Institutions.json?pageSize=1000', {
    headers: {
      'Authorization': `Basic ${process.env.UNISTATS_AUTH}`
    }
  }).then(function(response) {
    return response.json();

  }).then(function(myJson) {

    var myUniList = myJson;

    // REMOVE INSTITUTIONS THAT ARE NOT UNIVERSITIES
    var expr = /university/;

    for (var i = 0; i < myUniList.length; i++) {
      if (!(myUniList[i].Name.toLowerCase().includes("university"))) {
        console.log("ITEM DELETED: " + myUniList[i].Name.toLowerCase());
        myUniList.splice(i, 1);

      } else if (!(expr.test(myUniList[i].Name.toLowerCase()))) {
        console.log("ITEM DELETED 2: " + myUniList[i].Name.toLowerCase());
        myUniList.splice(i, 1);
      }
    }

    // FORMAT THE DATA
    let uniReturnList = [];
    for (var i = 0; i < myUniList.length; i++) {
        let innerUniJson = {};
        innerUniJson.pubukprn = myUniList[i].UKPRN;
        innerUniJson.name = myUniList[i].Name;
        uniReturnList.push(innerUniJson);
    }

    console.log(uniReturnList);
    console.log(uniReturnList.length);

    return uniReturnList;
  });
  return promise;
}



/**
  * Gets specific information for the requested university from MongoDB & Unistats.
  * @param {string} pubukprn - The university identifier.
  * @return {JSON OBJECT} promise - the JSON oject of university information.
  */
function getUniversity(pubukprn){
  // Sussex pubukprn 10007806
  const promise = fetch('http://data.unistats.ac.uk/api/v4/KIS/Institution/' + pubukprn + '.json', {
    headers: {
      'Authorization': 'Basic ' + process.env.UNISTATS_AUTH
    }
  }).then(function(response) {
    // returns the succeeded promise to the next .then()
    return response.json();

  }).then(res => {


    console.log("RES: " + res);

    const uniStatsResponse = res;


      let newJson = {};
      newJson.pubukprn = uniStatsResponse.UKPRN;
      newJson.name = uniStatsResponse.Name;
      newJson.unionURL = uniStatsResponse.StudentUnionUrl;

    return newJson;

  }).then(resUniStats => {
    const query = {
      pubukprn: resUniStats.pubukprn
    };

    return database.collection("uni").findOne(query).then(university => {
      return new Promise((resolve, reject) => {
        console.log("UNIVERSITY: " + university);
        resolve([university, resUniStats])
      })
    });
  }).then(finalRes => {

    console.log("FINAL RES 0: " + finalRes[0]);
    console.log("FINAL RES 1: " + finalRes[1]);

    const dbPromise = finalRes[0];
    let finalResJson = finalRes[1];

    finalResJson.url = dbPromise.url;
    finalResJson.color = dbPromise.color;
    finalResJson.lat = dbPromise.lat;
    finalResJson.lon = dbPromise.lon;
    finalResJson.averageRent = dbPromise.averageRent;
    finalResJson.uniLocationType = dbPromise.uniLocationType;
    finalResJson.uniType = dbPromise.uniType;
    finalResJson.nearestTrainStation = dbPromise.nearestTrainStation;

    console.log(JSON.stringify(finalResJson));

    return finalResJson;

  }).catch(err => console.log(err));

  return promise;
}

/**
  * Gets all the courses for a specific university.
  * This will never usually be called by itself, but through a university.
  * @param {string} pubukprn - The university identifier.
  * @return {Array[Objects]} promise - An array of JSON objects for courses for the university.
  */
function getCourses(pubukprn) {
  // Sussex pubukprn 10007806
  const promise = fetch('http://data.unistats.ac.uk/api/v4/KIS/Institution/' + pubukprn + '/Courses.json?pageSize=300', {
    headers: {
      'Authorization': 'Basic ' + process.env.UNISTATS_AUTH
    }
  }).then(function(response) {
    // returns the succeeded promise to the next .then()
    return response.json();

  }).then(res => {

    console.log("RES: " + res);

    const uniStatsResponse = res;

    let newJson = [];

    for (var i = 0; i < uniStatsResponse.length; i++) {
      let newInnerJson = {};
      newInnerJson.title = uniStatsResponse[i].Title;
      newInnerJson.kiscourseid = uniStatsResponse[i].KisCourseId;
      newInnerJson.isFullTime = uniStatsResponse[i].KisMode;
      newJson.push(newInnerJson);
    }

    return newJson;
  }).catch(err => console.log(err));

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
          send401Unauthorized(res);
        }
      }
    });
    console.log("Db after", database)
  } else {
    send401Unauthorized(res);
  }
});
/**
  * Gets specific information for the requested university from MongoDB & Unistats.
  * @param {string} pubukprn - The university identifier.
  * @param {string} kiscourseid - The course identifier.
  * @return {JSON OBJECT} promise - the JSON oject of course information.
  */
function getCourseInfo(pubukprn, kiscourseid) {

  // Using sussexMComp as a default;
  // Sussex pubukprn = 10007806
  // Computer Science MComp = 37310

  return fetch("http://data.unistats.ac.uk/api/v4/KIS/Institution/" + pubukprn + "/Course/" + kiscourseid + "/FullTime.json", {
    headers: {
      'Authorization': 'Basic ' + process.env.UNISTATS_AUTH
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

app.use('/v0', graphqlHTTP({schema, graphiql: true}));

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
