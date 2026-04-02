const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "username is already taken"],
        require: true
    },
    email: {
        type: String,
        unique: [true, "account already exists with this email address"],
        require: true
    },
    password: {
        type: String,
        require: true,

    }
})

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;