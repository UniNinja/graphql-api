require('dotenv').config()


var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb://kay:UniNinja@mycluster0-shard-00-00.mongodb.net:27017,mycluster0-shard-00-01.mongodb.net:27017,mycluster0-shard-00-02.mongodb.net:27017/admin?ssl=true&replicaSet=Mycluster0-shard-0&authSource=admin";
MongoClient.connect(uri, function(err, db) {
  console.log('Connection to DB has been made!');
  db.close();
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
  } else {
    res.send('Android > iOS');
  }
})

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
