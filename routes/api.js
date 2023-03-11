const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require('../models/User');
const nodemailer = require('nodemailer');
const moment = require('moment')
const crypto = require('crypto');

router.get("/register", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            res.redirect("/")
        } else {
            res.render('api/register', {
                faild: req.flash('faild'),
                faildUserName: req.flash('faild-username'),
                user: user,
            })
        }

    } catch (err) {
        console.log(err);
    }
})

router.post("/register", async (req, res) => {
    try {
        const { name, username, email, password, phone } = req.body

        const uniqueEmail = await User.findOne({ email: email })
        const uniqueUserName = await User.findOne({ username: username })
        const check = Math.floor(Math.random() * 10000)
        const sipher = crypto.randomBytes(50).toString('hex')
        if (uniqueEmail) {
            req.flash('faild', "none")
            res.redirect("back")
        } else {
            if (uniqueUserName) {
                req.flash('faild-username', "none")
                res.redirect("back")
            } else {

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'iqevolution1@gmail.com',
                        pass: 'kdulyzpkifwzvsdd'
                    }
                });

                let from = `Epassion Team <imtbymail@gmail.com>`

                var mailOptions = {
                    from: from,
                    to: `${email}`,
                    subject: `Hello Dear ${name}`,
                    html: ` <div style="background-color: #22abe1; border-radius: 7px; font-family:Arial, Helvetica, sans-serif; justify-content: center!important; display:grid">
                    <br>
                    <img src="cid:logo" style="width: 100px; margin-left: 126px; margin-bottom: -20px;"><br>
                    <p style="font-size: 30px; font-weight: bold; text-align: center; margin-top: 10px; width: 80%; margin-left: auto; margin-right: auto; color: #fff; border-bottom: 2px solid #fff;">Epassion Team</p>
                    <p style="font-size: 20px; color: #fff; text-align: center;">Congratulations for your new account.</p>
                    <p style="font-size:20px; color: #fff; text-align: center;">Your activation Code is</p>
                    <p style="font-size:35px; color: #fff; text-align: center; font-weight: bold; margin-top: 0px;">${check}</p>
                    <p style="font-size:15px; color: #fff; text-align: center;">Don't share it with strangers ;D</p>
                    <br>
                    <br>
                </div>`,
                    attachments: [{
                        filename: 'Logo.png',
                        path: './public/images/logo.png',
                        cid: 'logo' //my mistake was putting "cid:logo@cid" here! 
                    }]
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                const hashedPassword = await bcrypt.hash(password, 10)
                const newUser = [
                    new User({
                        name: name,
                        username: username,
                        email: email,
                        password: hashedPassword,
                        check: check,
                        phone: phone,
                        sipher: sipher,
                        notifications: [],
                    })
                ]

                newUser.forEach(user => {
                    user.save()
                    res.cookie("email", email, { maxAge: moment().add(4, "months") })
                    res.redirect("/api/check")
                })
            }

        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/check", async (req, res) => {
    try {
        const email = req.cookies.email
        const userID = req.cookies.id
        const user = await User.findOne({ email: email })
        const userIdCheck = await User.findOne({ _id: userID })
        if (user) {
            if (user.isActive == false) {
                res.render("api/check", {
                    email: email,
                    checkFaild: req.flash("check-faild"),
                    resend: req.flash("resend-suc"),
                    user: user,
                })
            } else {
                res.redirect("/")
            }
        } else {
            if (userIdCheck) {
                res.redirect("/")
            } else {
                res.redirect("/api/login")
            }
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/check", async (req, res) => {
    try {
        const email = req.cookies.email
        const user = await User.findOne({ email: email })

        if (user) {
            if (user.isActive == false) {
                const activationCode = req.body.check

                if (activationCode == user.check) {
                    await User.updateOne({ email: email }, {
                        $set: {
                            isActive: true,
                        }
                    })

                    req.flash("activation-success", "success")
                    res.clearCookie("email")
                    res.cookie("id", user.id, { maxAge: moment().add(4, "months") })
                    res.redirect("/")
                } else {
                    req.flash("check-faild", "error")
                    res.redirect("back")
                }
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (error) {
        console.log(error);
    }
})

router.post("/resend", async (req, res) => {
    try {
        const email = req.cookies.email
        const user = await User.findOne({ email: email })

        let from = `Epassion Team <imtbymail@gmail.com>`

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'iqevolution1@gmail.com',
                pass: 'kdulyzpkifwzvsdd'
            }
        });


        var mailOptions = {
            from: from,
            to: `${email}`,
            subject: `Hello Dear ${user.name}`,
            html: ` <div style="background-color: #22abe1; border-radius: 7px; font-family:Arial, Helvetica, sans-serif; justify-content: center!important; display:grid">
            <br>
            <img src="cid:logo" style="width: 100px; margin-left: 126px; margin-bottom: -20px;"><br>
            <p style="font-size: 30px; font-weight: bold; text-align: center; margin-top: 10px; width: 80%; margin-left: auto; margin-right: auto; color: #fff; border-bottom: 2px solid #fff;">Epassion Team</p>
            <p style="font-size: 20px; color: #fff; text-align: center;">Congratulations for your new account.</p>
            <p style="font-size:20px; color: #fff; text-align: center;">Your activation Code is</p>
            <p style="font-size:35px; color: #fff; text-align: center; font-weight: bold; margin-top: 0px;">${user.check}</p>
            <p style="font-size:15px; color: #fff; text-align: center;">Don't share it with strangers ;D</p>
            <br>
            <br>
        </div>`,
            attachments: [{
                filename: 'Logo.png',
                path: './public/images/logo.png',
                cid: 'logo'
            }]
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        req.flash("resend-suc", "success")
        res.redirect("back")
    } catch (error) {
        console.log(error);
    }
})

router.get("/login", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            res.redirect("/")
        } else {
            res.render("api/login", {
                user: user,
                err: req.flash("login-err"),
                forget: req.flash("forget-suc"),
                reset: req.flash("reset-pass-suc"),
            })
        }
    } catch (err) {
        console.log(err);
    }
})

router.post("/login", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            res.redirect("/")
        } else {
            const { email, password } = req.body
            const userInfo = await User.findOne({ email: email })

            if (userInfo) {
                const comapre = await bcrypt.compare(password, userInfo.password)

                if (comapre) {
                    if (userInfo.isActive == true) {
                        res.cookie("id", userInfo.id, { maxAge: moment().add(4, "months") })
                        res.redirect("/")
                    } else {
                        res.cookie("email", userInfo.email)
                        res.redirect("/api/check")
                    }
                } else {
                    req.flash("login-err", "error")
                    res.redirect("back")
                }
            } else {
                req.flash("login-err", "error")
                res.redirect("back")
            }

        }
    } catch (err) {
        console.log(err);
    }
})

router.post("/forget", async (req, res) => {
    try {
        const email = req.body.email
        const user = await User.findOne({ email: email })
        const sipher = crypto.randomBytes(50).toString('hex')

        if (user) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'iqevolution1@gmail.com',
                    pass: 'kdulyzpkifwzvsdd'
                }
            });


            var mailOptions = {
                from: 'Epassion Team',
                to: `${email}`,
                subject: `Hello Dear ${user.name}`,
                text: `Reset your password http://localhost:3000/api/forget/${user.sipher}/${user.email}`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            req.flash("forget-suc", "success");
            res.redirect("back")
        } else {
            req.flash("login-err", "error")
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/forget/:sipher/:email", async (req, res) => {
    try {
        const { sipher, email } = req.params
        const user = await User.findOne({ email: email })
        const userID = await User.findOne({ _id: req.cookies.id })
        const id = req.cookies.id
        const getUser = await User.findOne({ _id: id })

        if (user.sipher == sipher) {
            res.render("api/reset", {
                user: getUser,
                email: email,
                hash: sipher,
            })
        } else {
            res.render("errors/forgetPass", {
                user: userID,
            })
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/reset/:sipher/:email", async (req, res) => {
    try {
        const password = req.body.password
        const hashedPassword = await bcrypt.hash(password, 10)
        const { email, sipher } = req.params

        const user = await User.findOne({ email: email })

        if (user.sipher == sipher) {
            await User.updateOne({ email: req.params.email }, {
                $set: {
                    password: hashedPassword,
                    sipher: crypto.randomBytes(50).toString('hex'),
                }
            })

            req.flash("reset-pass-suc", "success")
            res.redirect("/api/login")
        } else {
            res.status(404).send
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/logout", async (req, res) => {
    try {
        res.clearCookie("id")
        res.redirect("/api/login")
    } catch (err) {
        console.log(err);
    }
})
module.exports = router