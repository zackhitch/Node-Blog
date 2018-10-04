const express = require('express');

const router = express.Router();

const userDb = require('../data/helpers/userDb');

// ERROR HELPER
const errorHelper = (status, message, res) => {
  res.status(status).json({ error: message });
};

// MIDDLEWARES
const toUpper = (req, res, next) => {
  req.body.name = req.body.name.toUpperCase();
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
router.get('/', (req, res) => {
  userDb
    .get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      return errorHelper(500, 'Something went and broke', res);
    });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  userDb
    .get(id)
    .then(user => {
      if (user === 0) {
        return errorHelper(404, 'No user by that ID in the DB', res);
      }
      res.status(200).json(user);
    })
    .catch(err => {
      return errorHelper(500, 'Server is on union mandated downtime, BRB', res);
    });
});

router.get('/:id/posts', (req, res) => {
  const { id } = req.params;
  userDb
    .getUserPosts(id)
    .then(posts => {
      if (posts === 0) {
        return errorHelper(404, 'No posts by that user, pal.', res);
      }
      res.status(200).json(posts);
    })
    .catch(err => {
      return errorHelper(500, 'Server is on strike!', res);
    });
});

router.post('/', nameCheck, toUpper, (req, res) => {
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
          return errorHelper(500, 'Epic Fail, Rebooting', res);
        });
    })
    .catch(err => {
      return errorHelper(500, 'Not today pal, not today.', res);
    });
});

router.delete('/:id', (req, res) => {
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
      return errorHelper(
        500,
        'Database unable to do this, bc it doesnt want to',
        res
      );
    });
});

router.put('/:id', nameCheck, toUpper, (req, res) => {
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
            if (user) {
              res.json(user);
            } else {
              return errorHelper(400, 'No user in here! Get out!');
            }
          })
          .catch(err => {
            return errorHelper(
              500,
              'Something broke! Call the plumber (aka developer)',
              res
            );
          });
      }
    })
    .catch(err => {
      return errorHelper(500, ':v:', res);
    });
});

module.exports = router;
