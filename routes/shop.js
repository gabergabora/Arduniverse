const express = require('express')
const Category = require('../models/Category')
const Product = require('../models/Product')
const User = require('../models/User')
const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const products = await Product.find({}).sort({ Date: -1 })
        const category = await Category.find({}).sort({ Date: -1 })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })
        res.render("user/shop/shop", {
            user: user,
            products: products,
            category: category,
            notifications
        })
    } catch (err) {
        console.log(err);
    }
})

router.get("/product/:name", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const product = await Product.findOne({ name: req.params.name })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })
        res.render("user/shop/product", {
            user: user,
            product: product,
            login_require: req.flash("require-login"),
            cart_err: req.flash("cart-add-error"),
            cart_suc: req.flash("cart_suc"),
            qty_err: req.flash("qty_err"),
            notifications,
        })
    } catch (err) {
        console.log(err);
    }
})

router.get("/category/:name", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id})
        const products = await Product.find({ category: req.params.name })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })
        res.render("user/shop/category", {
            user: user,
            products: products,
            cat: req.params.name,
            notifications
        })
    } catch (err) {
        console.log(err);
    }
})
module.exports = router