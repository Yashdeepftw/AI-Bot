const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model')

async function authUser(req, res, next) {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({
            msg: "token not provided"
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if(isTokenBlacklisted) {
        return res.status(401).json({
            msg: "token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;

        next()
    }
    catch (err) {
        return res.status(401).json({
            msg: "invalid token"
        })
    }

}

module.exports = { authUser }