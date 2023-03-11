const express = require('express')
const User = require('../models/User')
const router = express.Router()

router.put("/follow/:id" , async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const getData = await User.findOne({ _id: req.params.id })
        const followers = getData.followers.map(x => x.id)
        if(user){
            var filter = false
            followers.forEach(data => {
                if(data == id){
                    filter = true
                } else {
                }
            })

            if(filter == false && id !== req.params.id){
                await User.updateOne({ _id: req.params.id }, {
                    $push: {
                        followers: {
                            id: user.id
                        }
                    }
                })

                await User.updateOne({ _id: id }, {
                    $push: {
                        following: {
                            id: req.params.id
                        }
                    }
                })
                res.redirect("back")
            } else {
                res.redirect("back")
            }
        } else {
            req.flash("follow-error", "error")
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/unfollow/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if(user){
            await User.updateOne({ _id: req.params.id }, {
                $pull: {
                    followers: {
                        id: user.id
                    }
                }
            })

            await User.updateOne({ _id: id }, {
                $pull: {
                    following: {
                        id: req.params.id
                    }
                }
            })
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/followers/:username", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const getData = await User.findOne({ username: req.params.username })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })

        if(getData){
            const followers = getData.followers.map(x => x.id)
            const followersData = await User.find({ _id: { $in: followers }})
            res.render("user/profile/followers-following", {
                user,
                followersData,
                followingData: [],
                type: "followers",
                notifications
            })
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/following/:username", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const getData = await User.findOne({ username: req.params.username })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })

        if(getData){
            const following = getData.following.map(x => x.id)
            const followingData = await User.find({ _id: { $in: following }})
            res.render("user/profile/followers-following", {
                user,
                followersData: [],
                followingData,
                type: "following",
                notifications
            })
        }
    } catch (err) {
        console.log(err);
    }
})



module.exports = router