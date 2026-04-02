const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

/**
 * @name registerUserController
 * @description register new user, expects username, email, password in request body
 * @access public
 *
 */

async function registerUserController(req, res) {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            msg: 'please provide password, email and username'
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            msg: 'Account already exists with this email address or username'
        })
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username, 
        email,
        password: hash,
        pass: password
    })

    const token = jwt.sign(
        { id: user._id, username: user.username},
        process.env.JWT_KEY,
        { expiresIn: "1d" }
    )

    res.cookie('token', token);

    res.status(201).json({
        msg: 'User Registed successfully',
        user: {
            id: user._id,
            email: user.email,
            username: user.username
        }
    })
}

/**
 * @name loginUserController
 * @description login user, expects password and email in request body
 * @access public
 */

async function loginUserController(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    
    if (!user) {
        res.status(400).json({
            msg: 'invaild email or password',
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        res.status(400).json({
            msg: 'invalid email or password'
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_KEY,
        { expiresIn: "1d" }
    )

    res.cookie("token", token);

    res.status(200).json({
        msg: 'user login successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name logoutUserController
 * @description logout user, expects token in cookies
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token;
    if(token) {
        await tokenBlacklistModel.create({ token });
    }
    res.clearCookie("token");
    res.status(200).json({
        msg: "user loggedout successfully"
    })
}

/**
 * @name getMeController
 * @description get the current user details 
 * @access private
 */

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id);

    res.status(201).json({
        msg: "user details fetch successfully",
        user: {
            username: user.username,
            id: user._id,
            email: user.email
        }
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}