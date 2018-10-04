const express = require('express');

const router = express.Router();

const postDb = require('../data/helpers/postDb');

// ERROR HELPER
const errorHelper = (status, message, res) => {
  res.status(status).json({ error: message });
};

// ROUTE HANDLERS
router.get('/', (req, res) => {
  postDb
    .get()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      return errorHelper(
        500,
        'Hey, I just met you, and this is crazy, but heres my error, so try again maybe?',
        res
      );
    });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  postDb
    .get(id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        return errorHelper(401, 'The post you seek, has no such ID.');
      }
    })
    .catch(err => {
      return errorHelper(500, 'Server AFK', res);
    });
});

router.post('/', (req, res) => {
  const { userId, text } = req.body;
  const newPost = { userId, text };
  postDb
    .insert(newPost)
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      return errorHelper(500, 'Server AFK', res);
    });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  postDb
    .remove(id)
    .then(postRemoved => {
      if (postRemoved) {
        res.status(201).json(postRemoved);
      } else {
        return errorHelper(400, 'No post with that ID');
      }
    })
    .catch(err => {
      return errorHelper(500, 'Server AFK', res);
    });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { userId, text } = req.body;
  const updatedPost = { userId, text };
  postDb
    .update(id, updatedPost)
    .then(updatedPosts => {
      if (updatedPosts) {
        res.status(200).json(updatedPosts);
      } else {
        return errorHelper(400, 'No post by that ID');
      }
    })
    .catch(err => {
      return errorHelper(500, 'Server AFK', res);
    });
});

module.exports = router;
