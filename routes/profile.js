const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Project = require('../models/Project');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/upload/images");
    },

    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1000 * 1000,
    },
});


router.get("/", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const projects = user.posts.map(x => x.projectImage)
        const data = await Project.find({ projectImage: { $in: projects } })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })
        if (user) {
            res.render("user/profile/profile", {
                user: user,
                type: "posts",
                cart: req.flash("cart-submit"),
                projects: data,
                notifications
            })
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/orders", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const orders = await Order.find({ email: user.email }).sort({ Date: -1 })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })
        if (user) {
            res.render("user/profile/orders", {
                user: user,
                orders: orders,
                type: "orders",
                cart: req.flash("cart-submit"),
                notifications
            })
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/edit/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })
        if (user.id == req.params.id) {
            res.render('user/profile/edit', {
                user,
                err: req.flash("username-unique"),
                notifications
            })
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/edit/:id", upload.single('image'), async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user.id == req.params.id) {
            const { name, username, bio, phone } = req.body

            const check = await User.find({ username: username })
            const filter = check.map(x => x.id)

            if (check.length == 0 || filter[0] == user.id) {

                await Project.updateMany({ username: user.username }, {
                    $set: {
                        username: username
                    }
                })

                if (typeof req.file === "undefined") {
                    await User.updateOne({ _id: req.params.id }, {
                        $set: {
                            name: name,
                            username: username,
                            bio: bio,
                            phone: phone,
                        }
                    })
                } else {
                    await User.updateOne({ _id: req.params.id }, {
                        $set: {
                            name: name,
                            username: username,
                            bio: bio,
                            phone: phone,
                            profileImage: req.file.filename,
                        }
                    })
                }

                res.redirect("/profile")
            } else {
                req.flash("username-unique", "error")
                res.redirect("back")
            }
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/get/:username", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const profileData = await User.findOne({ username: req.params.username })
        const data = profileData.posts.map(x => x.projectImage)
        const projects = await Project.find({ projectImage: { $in: data } }).sort({ Date: -1 })

        if (profileData) {
            const followers = profileData.followers.map(x => x.id)
            var filter = false

            followers.forEach(data => {
                if (data == id) {
                    filter = true
                }
            })

            var notifications = []
            user.notifications.forEach(notify => {
                if(notify.status == "new"){
                    notifications.push(notify.status)
                }
            })

            res.render("user/profile/getProfile", {
                user,
                profileData,
                projects,
                filter,
                notifications
            })
        } else {
            req.flash('search-error', 'error')
            res.redirect("/")
        }
    } catch (err) {
        console.log(err);
    }
})
module.exports = router