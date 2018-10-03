const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const port = 9000;
const userDb = require('./data/helpers/userDb');

const server = express();
server.use(express.json(), cors(), helmet(), morgan('combined'));

// ERROR HELPER
const errorHelper = (status, message, res) => {
  res.status(status).json({ error: message });
};

// MIDDLEWARE
const toUpper = (req, res, next) => {
  if (req.body) {
    req.body.name = req.body.name.toUpperCase();
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

const nameCheck = (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    errorHelper(404, 'Name must be included', res);
    next();
  } else {
    next();
  }
};

// ROUTE HANDLERS
server.get('/', (req, res) => {
  res.status(200).send(`Hello!`);
});

server.get('/api/users', (req, res) => {
  userDb
    .get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      return errorHelper(500, 'Something went and broke', res);
    });
});

server.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  userDb
    .get(id)
    .then(user => {
      if (user === 0) {
        return errorHelper(404, 'No user by that Id in the DB', res);
      }
      res.status(200).json(user);
    })
    .catch(err => {
      return errorHelper(500, 'Internal Server Error, sorry bro', res);
    });
});

server.get('/api/users/:id/posts', (req, res) => {
  const { id } = req.params;
  userDb
    .getUserPosts(id)
    .then(posts => {
      if (posts === 0) {
        return errorHelper(404, 'No posts by that user dude', res);
      }
      res.status(200).json(posts);
    })
    .catch(err => {
      return errorHelper(500, 'Database fail', res);
    });
});

server.post('/api/users', nameCheck, (req, res) => {
  const { name } = req.body;
  const newUser = { name };
  userDb
    .insert(newUser)
    .then(userId => {
      const { id } = userId;
      userDb
        .get(id)
        .then(user => {
          if (!user) {
            res
              .status(400)
              .json({ errorMessage: `No user with that ID exists.` });
          }
          res.status(200).json(user);
        })
        .catch(err => {
          return errorHelper(500, 'Database Epic Fail', res);
        });
    })
    .catch(err => {
      return errorHelper(500, 'Database More Epic Fail', res);
    });
});

server.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  userDb
    .remove(id)
    .then(userRemoved => {
      if (userRemoved === 0) {
        return errorHelper(404, 'No user by that id');
      } else {
        res.status(201).json({ success: 'User Removed' });
      }
    })
    .catch(err => {
      return errorHelper(500, 'Database unable to do this', res);
    });
});

server.put('/api/users/:id', nameCheck, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const updatedUser = { name };
  userDb
    .update(id, updatedUser)
    .then(response => {
      if (response === 0) {
        return errorHelper(404, 'No user by that id');
      } else {
        userDb
          .get(id)
          .then(user => {
            res.json(user);
          })
          .catch(err => {
            return errorHelper(500, 'No soup for you!', res);
          });
      }
    })
    .catch(err => {
      return errorHelper(500, 'No soup for you!', res);
    });
});

server.listen(port, () =>
  console.log(`\n=== API running on port: ${port} ===\n`)
);
