const express = require("express");
const app = express();
const cookieParse = require('cookie-parser')
const cors = require('cors')

app.use(express.json());
app.use(cookieParse());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}))

const authRouter = require('../routes/auth.routes');

app.use('/api/auth', authRouter);


module.exports = app;