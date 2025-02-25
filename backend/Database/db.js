const mongoose = require('mongoose')

const connectToDB = async () => {
    try{
       await mongoose.connect(process.env.MONGO_URI)
        console.log("App connected to DB")
    } catch (err) {
        console.log("Error connectiong to DB", err)
    }
}

module.exports = connectToDB