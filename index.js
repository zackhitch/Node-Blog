const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const port = 9000;
const userDb = require('./data/helpers/userDb');

const server = express();
server.use(express.json(), cors(), helmet(), morgan('combined'));

// MIDDLEWARE
const toUpper = (req, res, next) => {
  if (req.body) {
    req.name = req.body.name.toUpperCase();
  } else {
    userDb
      .get(req.params.id)
      .then(response => {
        req.name = response.name.toUpperCase();
      })
      .catch(err => {
        res.status(500).json({ message: err });
      });
  }
  next();
};

// ROUTE HANDLERS
server.get('/', (req, res) => {
  res.status(200).send(`Hello!`);
});

server.get('/api/users', (req, res) => {
  userDb
    .get()
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      res.status(500).json({ message: err });
    });
});

server.get('/api/users/:id', toUpper, (req, res) => {
  const { id } = req.params;
  userDb
    .get(id)
    .then(response => {
      res.status(200).json(req.name);
    })
    .catch(err => {
      res.status(500).json({ message: err });
    });
});

server.post('/api/users', (req, res) => {});

server.listen(port, () =>
  console.log(`\n=== API running on port: ${port} ===\n`)
);
