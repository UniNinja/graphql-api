const graphqlHTTP = require('express-graphql')
const schema = require('./graphql/schema/Schema')

const express = require('express');
const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

// app.get('/', (req, res) => {
//   res.send('Welcome to UniNinja');
// });

app.listen(3000, () => console.log('Server running'));
