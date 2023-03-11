const express = require('express');
const Category = require('../models/Category');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const moment = require('moment');
const nodemailer = require('nodemailer');
const fs = require('fs');
const Product = require('../models/Product');
const Order = require('../models/Order');

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

router.get("/category", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const category = await Category.find({}).sort({ Date: -1 })
        if (user) {
            if (user.isAdmin == true) {
                res.render('admin/category', {
                    user: user,
                    suc: req.flash("category-add-suc"),
                    category: category,
                    del: req.flash("suc-del"),
                    err: req.flash("err-category"),
                    update: req.flash("category-updated"),
                    edit: false,
                    cat: "none"
                })
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.post("/category/add", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            if (user.isAdmin == true) {

                const filter = await Category.findOne({ name: req.body.name })
                if (filter) {
                    req.flash("err-category", "error")
                    res.redirect("back")
                } else {
                    const newCategory = [
                        new Category({
                            name: req.body.name,
                            Date: moment().locale("ar-kw").format("l")
                        })
                    ]

                    newCategory.forEach(category => {
                        category.save()
                        req.flash("category-add-suc", "success")
                        res.redirect("back")
                    })
                }
            } else {
                rse.redirect("/")
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.delete("/category/delete/:id", async (req, res) => {
    const id = req.cookies.id
    const user = await User.findOne({ _id: id })

    if (user.isAdmin == true) {
        await Category.deleteOne({ _id: req.params.id })
        req.flash("suc-del", "success")
        res.redirect("back")
    } else {
        res.redirect("/")
    }
})

router.get("/category/edit/:name", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const category = await Category.find({}).sort({ Date: -1 })
        const cat = await Category.findOne({ name: req.params.name })
        if (user) {
            if (cat) {
                if (user.isAdmin == true) {
                    res.render('admin/category', {
                        user: user,
                        suc: req.flash("category-add-suc"),
                        category: category,
                        del: req.flash("suc-del"),
                        err: req.flash("err-category"),
                        update: req.flash("category-updated"),
                        edit: true,
                        cat: cat,
                    })
                }
            } else {
                res.redirect("/admin/category")
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/category/edit/:name", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        if (user) {
            if (user.isAdmin == true) {
                const name = req.body.name
                const filter = await Category.findOne({ name: name })

                if (filter) {
                    req.flash("err-category", "error")
                    res.redirect("/admin/category")
                } else {
                    await Category.updateOne({ name: req.params.name }, {
                        $set: { name: name }
                    })

                    await Product.updateMany({ category: req.params.name }, {
                        $set: {
                            category: name
                        }
                    })
                    req.flash("category-updated", "success")
                    res.redirect("/admin/category")
                }
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/products", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            if (user.isAdmin == true) {
                const category = await Category.find({}).sort({ Date: -1 })
                const products = await Product.find({}).sort({ Date: 1 })
                res.render("admin/products", {
                    user: user,
                    category: category,
                    suc: req.flash("product-suc"),
                    err: req.flash("product-err"),
                    del: req.flash("del-success"),
                    edit_suc: req.flash("edit-suc"),
                    products: products,
                    data: "none",
                    edit: false,
                })
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.post("/product/add", upload.single("image"), async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            if (user.isAdmin == true) {
                const { name, price, proText, des, category } = req.body

                const filter = await Product.findOne({ name: name })
                const str = des.replace(/(?:\r\n|\r|\n)/g, '\n');

                if (filter) {
                    req.flash("product-err", "error")
                    res.redirect("back")
                } else {
                    const newProduct = [
                        new Product({
                            name: name,
                            price: price,
                            proText: proText,
                            des: str,
                            category: category,
                            image: req.file.filename,
                            Date: moment().locale("ar-kw").format("l")
                        })
                    ]

                    newProduct.forEach(data => {
                        data.save()
                        req.flash("product-suc", "success")
                        res.redirect("back")
                    })
                }
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.delete("/product/delete/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const product = await Product.findOne({ _id: req.params.id })
        if (user) {
            if (user.isAdmin == true) {
                fs.unlinkSync(`./public/upload/images/${product.image}`)
                await Product.deleteOne({ _id: req.params.id })
                req.flash("del-success", "success")
                res.redirect("back")
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/product/edit/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const product = await Product.findOne({ _id: req.params.id })
        const products = await Product.find({}).sort({ Date: -1 })
        const category = await Category.find({}).sort({ Date: -1 })
        if (user) {
            if (user.isAdmin == true) {
                if (product) {
                    res.render("admin/products", {
                        user: user,
                        category: category,
                        suc: req.flash("product-suc"),
                        err: req.flash("product-err"),
                        del: req.flash("del-success"),
                        edit_suc: req.flash("edit-suc"),
                        products: products,
                        data: product,
                        edit: true,
                    })
                } else {
                    res.redirect("/admin/products")
                }
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/product/edit/:id", upload.single("image"), async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const { name, des, proText, price, category } = req.body
        const str = des.replace(/(?:\r\n|\r|\n)/g, '\n');
        const data = await Product.findOne({ _id: req.params.id })

        if (user) {
            if (user.isAdmin == true) {
                if (typeof req.file === "undefined") {
                    await Product.updateOne({ _id: req.params.id }, {
                        $set: {
                            name: name,
                            des: str,
                            proText: proText,
                            price: price,
                            category: category,
                        }
                    })
                } else {
                    fs.unlinkSync(`./public/upload/images/${data.image}`)
                    await Product.updateOne({ _id: req.params.id }, {
                        $set: {
                            name: name,
                            des: str,
                            proText: proText,
                            price: price,
                            category: category,
                            image: req.file.filename
                        }
                    })
                }

                req.flash("edit-suc", "success")
                res.redirect("/admin/products")
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/orders", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const orders = await Order.find({ isAccept: false, isReject: false, isReview: true }).sort({ Date: -1 })
        if(user){
            if(user.isAdmin == true){
                res.render("admin/orders", {
                    user: user,
                    orders: orders,
                    title: "New Orders",
                    accept: req.flash("order-accepted"),
                    reject: req.flash("order-rejected"),
                })
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/orders/accepted", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const orders = await Order.find({ isAccept: true }).sort({ Date: -1 })
        if(user){
            if(user.isAdmin == true){
                res.render("admin/orders", {
                    user: user,
                    orders: orders,
                    title: "Accepted Orders",
                    accept: req.flash("order-accepted"),
                    reject: req.flash("order-rejected"),
                })
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/orders/rejected", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const orders = await Order.find({ isReject: true }).sort({ Date: -1 })
        if(user){
            if(user.isAdmin == true){
                res.render("admin/orders", {
                    user: user,
                    orders: orders,
                    title: "Rejected Orders",
                    accept: req.flash("order-accepted"),
                    reject: req.flash("order-rejected"),
                })
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/orders/history", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const orders = await Order.find({}).sort({ Date: -1 })
        if(user){
            if(user.isAdmin == true){
                res.render("admin/orders", {
                    user: user,
                    orders: orders,
                    title: "Orders History",
                    accept: req.flash("order-accepted"),
                    reject: req.flash("order-rejected"),
                })
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/order/get/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const order = await Order.findOne({ _id: req.params.id })

        if(user){
            if(user.isAdmin == true){
                res.render("admin/order", {
                    order: order,
                    user: user,
                })
            } else {
                res.redirect("/")
            }
        } else {
            res.redirect("api/login")
        }
    } catch (err) {
        console.log(err);
    }
})


router.put("/order/status/accept/:id", async (req, res) =>{
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const order = await Order.findOne({ _id: req.params.id })

        if(user){
            if(user.isAdmin == true){
                await Order.updateOne({ _id: req.params.id }, {
                    $set: {
                        isAccept: true,
                        isReview: false,
                        isReject: false
                    }
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
                    to: `${order.email}`,
                    subject: `Hello Dear ${order.name}`,
                    html: ` <div style="background-color: #5cb85c; border-radius: 7px; font-family:Arial, Helvetica, sans-serif; justify-content: center!important; display:grid">
                    <br>
                    <img src="cid:logo" style="width: 100px; margin-left: 126px; margin-bottom: -20px;"><br>
                    <p style="font-size: 30px; font-weight: bold; text-align: center; margin-top: 10px; width: 80%; margin-left: auto; margin-right: auto; color: #fff; border-bottom: 2px solid #fff;">Epassion Team</p>
                    <p style="font-size: 20px; color: #fff; text-align: center;">Your order has been Accepted.</p>
                    <p style="font-size:20px; color: #fff; text-align: center;">You can check it on your profile</p>
                    <p style="font-size:15px; color: #fff; text-align: center;">Your bill ID : ${order.bill_id}</p>
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

                req.flash("order-accepted", "success");
                res.redirect("/admin/orders")
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/order/status/reject/:id", async (req, res) =>{
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const order = await Order.findOne({ _id: req.params.id })

        if(user){
            if(user.isAdmin == true){
                await Order.updateOne({ _id: req.params.id }, {
                    $set: {
                        isReject: true,
                        isReview: false,
                        isAccept: false,
                    }
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
                    to: `${order.email}`,
                    subject: `Hello Dear ${order.name}`,
                    html: ` <div style="background-color: #d9534f; border-radius: 7px; font-family:Arial, Helvetica, sans-serif; justify-content: center!important; display:grid">
                    <br>
                    <img src="cid:logo" style="width: 100px; margin-left: 126px; margin-bottom: -20px;"><br>
                    <p style="font-size: 30px; font-weight: bold; text-align: center; margin-top: 10px; width: 80%; margin-left: auto; margin-right: auto; color: #fff; border-bottom: 2px solid #fff;">Epassion Team</p>
                    <p style="font-size: 20px; color: #fff; text-align: center;">Your order has been rejected.</p>
                    <p style="font-size:20px; color: #fff; text-align: center;">If you think there's any mistake please contact US</p>
                    <p style="font-size:15px; color: #fff; text-align: center;">Your bill ID : ${order.bill_id}</p>
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

                req.flash("order-rejected", "success");
                res.redirect("/admin/orders")
            }
        } else {
            res.redirect("/api/login")
        }
    } catch (err) {
        console.log(err);
    }
})

module.exports = router