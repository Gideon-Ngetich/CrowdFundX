const express = require('express')
const cors = require('cors')
const dotenv = require("dotenv")
dotenv.config()
const connectToDB = require('./Database/db')
const register = require('./routes/register.route')
const crowdFunding = require("./routes/crowdFundingRegistration.route")
const mpesaAccountDetails = require("./routes/AddMpesaAccountDetails.route")
const login = require('./routes/login.route')
const myCampaigns = require("./routes/myCampaigns.route")
const bodyParser = require('body-parser')
const mpesa_stk = require('./controllers/MpesaCallback')
const getCrowdRecords = require('./routes/getCrowdRecords')
const getCampaignAccounts = require("./routes/getCampaignAccountDetails.route")
const getCampaigns = require('./routes/getCampaigns.route')
const groupFundingRegistration = require('./routes/GroupFundingRegistration.route')
const getMpesaAccountDetails = require("./routes/getMpesaAccounts.route")

const app = express()

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
connectToDB()
const port = process.env.PORT

app.use('/api/register', register);
app.use('/api/crowdfunding', crowdFunding)
app.use('/api/mpesadetails', mpesaAccountDetails)
app.use('/api/login', login)
app.use('/api/mycampaigns', myCampaigns)
app.use('/api', mpesa_stk)
app.use('/api/getcrowdrecords', getCrowdRecords)
app.use('/api/getaccountdetails', getCampaignAccounts)
app.use('/api/getcampaigns', getCampaigns)
app.use('/api/groupfundingregistration', groupFundingRegistration)
app.use('/api/getmpesadetails', getMpesaAccountDetails)

app.listen(port, () => {
    console.log(`app running on port ${port}`)
})

app.get('/test', (req, res) => {
    res.send({"message": "Hello world"})
})