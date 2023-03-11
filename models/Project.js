const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
    },

    parts: {
        type: String,
    },

    username: {
        type: String,
    },

    userId: {
        type: String,
    },

    des: {
        type: String,
    },

    code: {
        type: String,
    },

    url: {
        type: String,
    },

    projectImage:{
        type: String,
    },

    images: [{
        type: String,
    }],

    likes:{
        type: Array,
        default: [],
    },

    comments: {
        type: Array,
        default: []
    },

    Date: {
        type : String,
    },

    sipher:{
        type: String,
    }
})

const Project = mongoose.model('Projects', projectSchema, 'Projects')
module.exports = Project