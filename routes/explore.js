const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.get("/", async (req, res) => {
    try {
        const userId = req.cookies.id
        const user = await User.findOne({ _id: userId })
        const users = await User.find({})
        const username = users.map(x => x.username)
        const getUsers = await User.aggregate([
            {$project: {
                numPosts: { $size: "$posts"},
                username: 1,
                name: 1,
                profileImage: 1,
                followers: 1,
                following: 1,
                posts: 1,
                bio: 1,
            }},
            {$sort: {numPosts: -1}},
            {$limit: 50}
        ])
        res.render('user/explore/explore', 
        {
            user: user,
            username: username,
            getUsers: getUsers,
            err: req.flash("search-user-error"),
        })
    } catch (err) {
        console.log(err)
    }
})

router.post("/search", async (req, res) => {
    try {
        const user = req.body.username
        const data = await User.findOne({ username: user})

        if(data){
            res.redirect(`/profile/get/${user}`)
        } else {
            req.flash("search-user-error", "error")
            res.redirect("/explore")
        }
    } catch (err) {
        console.log(err)
    }
})
module.exports = router