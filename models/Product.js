const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
    },

    price: {
        type: Number,
    },

    proText: {
        type: String,
    },

    des: {
        type: String,
    },

    inStock: {
        type: Boolean,
        default: true,
    },

    category: {
        type: String,
    },

    image: {
        type: String,
    },

    Date: {
        type: String,
    }
})

const Product = mongoose.model('Product', productSchema, 'Product')
module.exports = Product