const express = require('express')
const cors = require('cors')
const dotenv = require("dotenv")
dotenv.config()
const connectToDB = require('./Database/db')
const register = require('./routes/register.route')
const crowdFunding = require("./routes/crowdFundingRegistration.route")
const mpesaAccountDetails = require("./routes/AddMpesaAccountDetails.route")
const mpesa_STK = require('./controllers/mpesaController')
const mpesa_callback = require('./controllers/mpesaCallback')
const login = require('./routes/login.route')

const app = express()

app.use(cors())
app.use(express.json())
connectToDB()
const port = process.env.PORT

app.use('/api/register', register);
app.use('/api/crowdfunding', crowdFunding)
app.use('/api/mpesadetails', mpesaAccountDetails)
app.use('/api/stk-push', mpesa_STK)
app.use('/api/mpesa-callback', mpesa_callback)
app.use('/api/login', login)

app.listen(port, () => {
    console.log(`app running on port ${port}`)
})

app.get('/test', (req, res) => {
    res.send({"message": "Hello world"})
})