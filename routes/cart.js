const express = require('express')
const Product = require('../models/Product')
const User = require('../models/User')
const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })

        if (user) {
            res.render("user/shop/cart", {
                user: user,
                notifications
            })
        } else {
            req.flash("require-login", "error")
            res.redirect("/")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/add/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            const data = await Product.findOne({ _id: req.params.id })
            const unique = await User.findOne({ _id: id }, {
                cart: { $elemMatch: { id: data.id } }
            })
            const filter = unique.cart.map(x => x.id)
            if (filter === undefined || filter.length == 0) {
                if (req.body.qty > 0) {
                    await User.updateOne({ _id: id }, {
                        $push: { cart: { name: data.name, price: data.price, image: data.image, qty: req.body.qty, id: data.id } }
                    })
                    req.flash("cart_suc", "success")
                    res.redirect("back")
                } else {
                    req.flash("qty_err", "error")
                    res.redirect("back")
                }
            } else {
                req.flash("cart-add-error", "error")
                res.redirect("back")
            }
        } else {
            req.flash("require-login", "error")
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/delete/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            await User.updateOne({ _id: id }, {
                $pull: { cart: { id: req.params.id }}
            })
            res.redirect("back")
        } else {
            req.flash("require-login", "error")
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})
module.exports = router