const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const crypto = require('crypto');
const moment = require('moment');
const nodemailer = require('nodemailer')

router.post("/new", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            const sipher = crypto.randomBytes(15).toString('hex')
            if (user.cart.length > 0) {
                const newOrder = [
                    new Order({
                        name: user.name,
                        email: user.email,
                        bill_id: sipher,
                        phone: user.phone,
                        Date: moment().locale("ar-kw").format("l"),
                        order: user.cart
                    })
                ]

                newOrder.forEach(data => {
                    data.save()
                })

                await User.updateOne({ _id: id }, {
                    $set: { cart: [] }
                })

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
                    to: `${user.email}`,
                    subject: `Hello Dear ${user.name}`,
                    html: ` <div style="background-color: #22abe1; border-radius: 7px; font-family:Arial, Helvetica, sans-serif; justify-content: center!important; display:grid">
                    <br>
                    <img src="cid:logo" style="width: 100px; margin-left: 126px; margin-bottom: -20px;"><br>
                    <p style="font-size: 30px; font-weight: bold; text-align: center; margin-top: 10px; width: 80%; margin-left: auto; margin-right: auto; color: #fff; border-bottom: 2px solid #fff;">Epassion Team</p>
                    <p style="font-size: 20px; color: #fff; text-align: center;">Thank you for your purchase.</p>
                    <p style="font-size:20px; color: #fff; text-align: center;">We will review it as soon as possible you can check it on your profile</p>
                    <p style="font-size:15px; color: #fff; text-align: center;">Your bill ID : ${sipher}</p>
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

                req.flash("cart-submit", "success");
                res.redirect("/profile/orders")
            } else {
                res.redirect("/")
            }
        } else {
            req.flash("require-login", "error")
            res.redirect("back")
        }
    } catch (err) {
        console.log(err);
    }
})


router.get("/get/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const order = await Order.findOne({ _id: req.params.id })
        var notifications = []
        user.notifications.forEach(notify => {
            if(notify.status == "new"){
                notifications.push(notify.status)
            }
        })
        if (user) {
            res.render("user/shop/order", {
                user: user,
                order: order,
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
module.exports = router