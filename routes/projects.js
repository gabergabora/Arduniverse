const express = require('express');
const router = express.Router();
const User = require('../models/User')
const Product = require('../models/Product');
const Project = require('../models/Project');
const multer = require('multer');
const crypto = require('crypto');
const moment = require('moment');

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

const MultiStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/upload/images");
    },

    filename: function (req, file, callback) {
        callback(null, Date.now() + crypto.randomBytes(30).toString('hex') + file.originalname);
    },
});

const MultiUpload = multer({
    storage: MultiStorage,
});

router.get("/", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const projects = await Project.find({}).sort({ Date: -1 })
        const names = projects.map(x => x.title)
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })
        res.render("user/projects/main", {
            user: user,
            login: req.flash("require-login"),
            projects: projects,
            notifications,
            names: names,
            err: req.flash("projects-search-error"),
        })
    } catch (err) {
        console.log(err);
    }
})

router.get("/add", async (req, res) => {
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
            res.render("user/projects/add", {
                user: user,
                notifications
            })
        } else {
            req.flash("require-login", "error")
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})

router.post("/add", upload.single('image'), async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            const { title } = req.body
            const sipher = crypto.randomBytes(100).toString('hex')
            const newProject = [
                new Project({
                    title: title,
                    username: user.username,
                    userId: user.id,
                    projectImage: req.file.filename,
                    Date: moment().locale("ar-kw").format("l"),
                    sipher: sipher,
                })
            ]

            newProject.forEach((data) => {
                data.save()
            })

            await User.updateOne({ _id: user.id }, {
                $push: {
                    posts: {
                        title: title,
                        projectImage: req.file.filename,
                        Date: moment().locale("ar-kw").format("l")
                    }
                }
            })

            res.redirect(`/projects/next/${sipher}`)
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/next/:crypto", async (req, res) => {
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
            const data = await Project.findOne({ sipher: req.params.crypto, username: user.username })
            res.render("user/projects/next", {
                user: user,
                data: data,
                notifications
            })
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/next/:crypto", MultiUpload.array('images'), async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const sipher = req.params.crypto
        const newCrypto = crypto.randomBytes(100).toString('hex')
        if (user) {
            const check = await Project.findOne({ sipher: sipher })
            if (user.username == check.username) {
                images = req.files.map(file => file.filename);

                const { des, code } = req.body
                await Project.updateOne({ sipher: sipher, username: user.username }, {
                    $set: {
                        des: des,
                        code: code,
                        sipher: newCrypto,
                    },

                    $push: {
                        images: images,
                    }
                })

                res.redirect(`/profile`)
            }
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/get/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Project.findOne({ _id: req.params.id })
        const author = await User.findOne({ username: data.username })
        const projects = await Project.find({ username: data.username }).sort({ Date: -1 }).limit(5)

        const SortCommentsByLikes = data.comments.sort((a, b) => {
            return Object.keys(b.likes).length - Object.keys(a.likes).length;
        })
        const usersIDs = SortCommentsByLikes.map(x => x.id)
        const usersData = []
        await User.find({ _id: { $in: usersIDs } }, function (err, array) {
            if (err) {
                throw err
            } else {
                var objects = {};

                array.forEach(o => objects[o._id] = o);
                var dupArray = usersIDs.map(id => objects[id]);
                dupArray.forEach(addData => {
                    usersData.push({
                        username: addData.username,
                        profileImage: addData.profileImage,
                        id: addData.id,
                    })
                })
            }
        }).clone().catch(function (err) { console.log(err) })
        if (user) {
            const unique = await Project.findOne({ _id: req.params.id }, {
                likes: { $elemMatch: { id: user.id } },
            })
            const filter = unique.likes.map(x => x.id)
            var like;

            if (filter.length > 0) {
                like = true
            } else {
                like = false
            }
        }

        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })

        const NowDate = moment().locale("ar-kw").format("l")
        res.render("user/projects/get", {
            user: user,
            data: data,
            author: author,
            projects: projects,
            like: like,
            usersData: usersData,
            NowDate,
            notifications
        })
    } catch (err) {
        console.log(err);
    }
})

router.put("/like/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const project = await Project.findOne({ _id: req.params.id })

        if (user) {
            await Project.updateOne({ _id: req.params.id }, {
                $push: {
                    likes: {
                        username: user.username,
                        image: user.profileImage,
                        id: user.id,
                    }
                }
            })

            await User.updateOne({ username: project.username }, {
                $push: {
                    notifications: {
                        id: user.id,
                        text: "Liked your porject",
                        project: project.id,
                        type: "project",
                        status: "new"
                    }
                }
            })

            res.redirect(`back`)
        } else {
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/remove-like/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const project = await Project.findOne({ _id: req.params.id })

        if (user) {
            await Project.updateOne({ _id: req.params.id }, {
                $pull: {
                    likes: { id: user.id }
                }
            })

            await User.updateOne({ username: project.username }, {
                $pull: {
                    notifications: {
                        id: user.id,
                        project: project.id,
                        text: "Liked your porject",
                    }
                }
            })
            res.redirect(`/projects/get/${req.params.id}`)
        } else {
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/comment/primary/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            await Project.updateOne({ _id: req.params.id }, {
                $push: {
                    comments: {
                        id: user.id,
                        Date: moment().locale("ar-kw").format("l"),
                        comment: req.body.comment,
                        commentID: crypto.randomBytes(100).toString('hex'),
                        likes: [],
                        replay: [],
                    }
                }
            })

            res.redirect(`back`)
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/comment/delete/:projectID/:commentID/:userID", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const { projectID, commentID, userID } = req.params

        if (user) {
            if (id == userID) {
                await Project.updateOne({ _id: projectID }, {
                    $pull: {
                        comments: {
                            commentID: commentID
                        }
                    }
                })

                res.redirect(`/projects/get/${projectID}`)
            } else {
                res.redirect(`/projects/get/${projectID}`)
            }
        } else {
            res.redirect(`/projects/get/${projectID}`)
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/comments/like/:projectID/:commentID", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const { projectID, commentID } = req.params
        if (user) {
            const project = await Project.findOne({ _id: projectID })
            const comments = project.comments
            var uniqueLikes = []
            var found = false
            comments.find((comment) => {
                comment.commentID = commentID
                if (comment) {
                    uniqueLikes = comment.likes.map((like) => {
                        return {id: like.id};
                    })
                }
            })

            uniqueLikes.forEach((like) => {
                if(like.id == user.id){
                    found =true
                }
            })

            if (found == true) {
                await Project.updateOne({ _id: projectID, 'comments.commentID': commentID }, {
                    $pull: {
                        'comments.$.likes': {
                            id: user.id
                        }
                    }
                })
                res.redirect(`/projects/get/${projectID}`)
            } else { 
                await Project.updateOne({ _id: projectID, 'comments.commentID': commentID }, {
                    $push: {
                        'comments.$.likes': {
                            id: user.id
                        }
                    }
                })
                res.redirect(`/projects/get/${projectID}`)
            }
        } else {
            res.redirect(`/projects/get/${projectID}`)
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/edit/project/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id : id})
        const data = await Project.findOne({ _id: req.params.id })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })

        if(user){
            if(user.username == data.username){
                res.render("user/projects/edit", { data, user, notifications })
            } else {
                res.redirect("back")
            }
        } else {
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})

router.delete("/delete/project/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id})
        const data = await Project.findOne({ _id: req.params.id })

        if(user.username == data.username){
            await User.updateOne({ _id: user.id }, {
                $pull: {
                    posts: {
                        title: data.title,
                        projectImage: data.projectImage,
                        Date: data.Date
                    }
                }
            })
            await Project.deleteOne({ _id: req.params.id }).then(() => {
                res.redirect("/profile")
            })
        }
    } catch (err) {
        console.log(err);
    }
})

router.post("/search", async (req, res) => {
    try{
        const name = req.body.name
        const data = await Project.findOne({ title: name })

        if(data){
            res.redirect(`/projects/get/${data.id}`)
        } else {
            req.flash("projects-search-error", "error")
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})
module.exports = router