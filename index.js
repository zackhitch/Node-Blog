const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const port = 9000;

const userRoutes = require('./Users/userRoutes');
const postRoutes = require('./Posts/postRoutes');

const server = express();
server.use(express.json(), cors(), helmet(), morgan('combined'));

// EXPRESS ROUTER HANDLERS
server.use('/api/users', userRoutes);
server.use('/api/posts', postRoutes);

server.listen(port, () =>
  console.log(`\n=== API running on port: ${port} ===\n`)
);
