const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const session = require("express-session")
const flash = require('express-flash');
const methodOverride = require("method-override")
const cookieParser = require("cookie-parser")
const db = require("./config/database")
const api = require("./routes/api")
const index = require("./routes/index")
const admin = require("./routes/admin");
const shop = require("./routes/shop")
const cart = require("./routes/cart")
const order = require("./routes/order")
const profile = require("./routes/profile")
const projects = require("./routes/projects")
const follow_system = require("./routes/follow-system")
const explore = require("./routes/explore")

let PORT = 3000

app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(session({
    secret: 'secret',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
}))
app.use(flash());
app.use(cookieParser());
app.use(express.json());

app.use("/api", api)
app.use("/", index);
app.use("/admin", admin);
app.use("/shop", shop)
app.use("/cart", cart);
app.use("/order", order);
app.use("/profile", profile);
app.use("/projects", projects);
app.use("/system", follow_system)
app.use("/explore", explore)

app.listen(PORT, (err) => {
    if (err) throw err
    console.log(`Server is running on port ${PORT}`);
})