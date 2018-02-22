const app = require('express')();

app.get('/', (req, res) => {
  res.send('Welcome to UniNinja');
});

app.listen(3000, () => console.log('Server running'));
