const mongoose = require('mongoose')
const URI = "mongodb://localhost:27017/arduino"

mongoose.connect(URI, (err) => {
    if(err) throw err
    console.log("Database connected");
})