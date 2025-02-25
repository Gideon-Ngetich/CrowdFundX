const express = require('express')
const cors = require('cors')
const dotenv = require("dotenv")
dotenv.config()
const connectToDB = require('./Database/db')

const app = express()

app.use(cors())
app.use(express.json())
connectToDB()
const port = process.env.PORT

app.listen(port, () => {
    console.log(`app running on port ${port}`)
})

app.get('/test', (req, res) => {
    res.send({"message": "Hello world"})
})