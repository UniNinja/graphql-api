require('dotenv').config()
const util = require('util');

var MongoClient = require('mongodb').MongoClient;
//var uri = "mongodb://ESRSAdmin:UniNinja@mycluster0-shard-00-00.mongodb.net:27017,mycluster0-shard-00-01.mongodb.net:27017,mycluster0-shard-00-02.mongodb.net:27017/UniNinjaDB?ssl=true&replicaSet=Mycluster0-shard-0&authSource=admin";
var uri = "mongodb://ESRSAdmin:UniNinja@cluster0-shard-00-00-d1bwx.mongodb.net:27017,cluster0-shard-00-01-d1bwx.mongodb.net:27017,cluster0-shard-00-02-d1bwx.mongodb.net:27017/uni?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin"

MongoClient.connect(uri, function(err, db) {
  if (err) {
    console.log("ERROR: " + err);
  }
   console.log("DB:" + db);
   console.log(util.inspect(db));
   console.log(db.collection("uni"));
});


const express = require('express')
const graphqlHTTP = require('express-graphql')
const app = express()

const schema = require('./graphql/schema/Schema')

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

//app.get('/', (req, res) => res.send("Hello from UniNinja !"))

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  if (req.query.username == "loic") {
    res.send('iOS > Android');
  } else if (req.query.username == "dan") {
    res.send('Android > iOS');
  } else {
    //res.send("The UniNinja API is coming soon!");
  }

  if (req.query.uni === "all"){
    MongoClient.connect(uri, function(err, db) {
      console.log('Connection to DB has been made for uni list return!');
      //db = db.getSiblingDB('uni');
      //db.close(); // remove this and it work
      //res.send(db.uni.find().pretty());
      console.log('DATABASE: ' + db);
    });
  }

});

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
