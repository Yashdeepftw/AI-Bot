const express = require("express");
const app = express();
const cookieParse = require('cookie-parser')

app.use(express.json());
app.use(cookieParse());

const authRouter = require('../routes/auth.routes');

app.use('/api/auth', authRouter);


module.exports = app;