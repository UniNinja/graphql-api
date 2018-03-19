import {schema} from './Schema'

require('dotenv').config()
const util = require('util');


// DATABASE SETUP
var uri = process.env.MONGODB_URI;
var database = null;
var databaseErr = null;
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(uri, function(err, connection) {
  if(connection) {
    database = connection.db(process.env.MONGODB_DATABASE);
  } else {
    databaseErr = err;
  }
});

// GRAPHQL SETUP
const express = require('express')
const graphqlHTTP = require('express-graphql')
const app = express()



app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))


// CURRENT LISTENER
app.get('/', function (req, res) {

  // BASIC USERNAME LISTENER
  if (req.query.username == "loic") {
    res.send('iOS > Android');
  } else if (req.query.username == "dan") {
    res.send('Android > iOS');
  } else {

    // DATABASE QUERY
    if(database) {
      database.collection("uni").find().toArray(function(err, dbRes) {
        if(err) console.log("Error");
        console.log(dbRes);
        res.send(dbRes);
      });

    // ELSE ERROR CONNECTING
    } else {
      res.send('Error connecting to database: '+databaseErr);
    }
  }
});

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
