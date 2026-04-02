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

/**
 * @route POST api/auth/logout
 * @description clear token from user cookie and add token to blacklist
 * @access public
 */

authRouter.get('/logout', authController.logoutUserController)



module.exports = authRouter;