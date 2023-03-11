const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    name:{
        type: String,
    },

    email: {
        type: String,
    },

    bill_id: {
        type: String,
    },

    phone: {
        type: String,
    },

    order: {
        type: Array,
    },

    isAccept: {
        type: Boolean,
        default: false,
    },

    isReject: {
        type: Boolean,
        default: false,
    },

    isReview: {
        type: Boolean,
        default: true,
    },

    Date: {
        type: String,
    }
})

const Order = mongoose.model('Order', orderSchema, 'Order')
module.exports = Order