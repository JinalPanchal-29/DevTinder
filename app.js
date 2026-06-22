const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const registerRoutes = require('./routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

registerRoutes(app);

module.exports = app;
