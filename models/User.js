const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },

    username: {
        type: String,
    },

    email: {
        type: String,
    },

    phone: {
        type: String,
    },

    password: {
        type: String,
    },

    isAdmin: {
        type: Boolean,
        default: false,
    },

    cart: {
        type: Array,
        default: [],
    },

    isActive: {
        type: Boolean,
        default: false,
    },

    check: {
        type: String,
    },

    Date: {
        type: String,
    },

    sipher: {
        type: String,
    },

    followers: {
        type: Array,
        default: [],
    },

    following: {
        type: Array,
        default: [],
    },

    bio: {
        type: String,
    },

    posts: {
        type: Array,
        default: [],
    },

    profileImage: {
        type: String,
        default: "none",
    },

    notifications: {
        type: Array,
        default: [],
    }
})

const User = mongoose.model('User', userSchema, 'User')
module.exports = User