const express = require('express');

const authRouter = express.Router();

const authController = require('../controllers/auth.controlles');
const authMiddleware = require('./middlewares/auth.middleware');

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

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */

authRouter.get('/get-me', authMiddleware.authUser, authController.getMeController)

module.exports = authRouter;