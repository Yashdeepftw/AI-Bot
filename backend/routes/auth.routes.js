const express = require('express');

const authRouter = express.Router();

const authController = require('../controllers/auth.controlles')

/**
 * @routes POST api/auth/register
 * @description register new user
 * @access public 
 */

authRouter.post('/register', authController.registerUserController)

/**
 * @route POST api/auth/login
 * @description login user with email and password
 * @access public
 */

authRouter.post('/login', authController.loginUserController)

module.exports = authRouter;