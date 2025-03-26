const express = require('express')
const cors = require('cors')
const dotenv = require("dotenv")
dotenv.config()
const http = require('http')
const WebSocketServer = require('./utils/websocket')
const connectToDB = require('./Database/db')
const register = require('./routes/register.route')
const crowdFunding = require("./routes/crowdFundingRegistration.route")
const mpesaAccountDetails = require("./routes/AddMpesaAccountDetails.route")
const login = require('./routes/login.route')
const myCampaigns = require("./routes/myCampaigns.route")
const bodyParser = require('body-parser')
const {router , handleWebSocketUpgrade} = require('./controllers/crowdFundingController')
const getCrowdRecords = require('./routes/getCrowdRecords')
const getCampaignAccounts = require("./routes/getCampaignAccountDetails.route")
const getCampaigns = require('./routes/getCampaigns.route')
const groupFundingRegistration = require('./routes/GroupFundingRegistration.route')
const getMpesaAccountDetails = require("./routes/getMpesaAccounts.route")
const getCampaignDetails = require("./routes/getCrowdCampaignDetails.route")

const app = express()

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
connectToDB()
const port = process.env.PORT
const server = http.createServer(app);
handleWebSocketUpgrade(server)
app.use('/api/register', register);
app.use('/api/crowdfunding', crowdFunding)
app.use('/api/mpesadetails', mpesaAccountDetails)
app.use('/api/login', login)
app.use('/api/mycampaigns', myCampaigns)
app.use('/api', router)
app.use('/api/getcrowdrecords', getCrowdRecords)
app.use('/api/getaccountdetails', getCampaignAccounts)
app.use('/api/getcampaigns', getCampaigns)
app.use('/api/groupfundingregistration', groupFundingRegistration)
app.use('/api/getmpesadetails', getMpesaAccountDetails)
app.use('/api/campaigndetails', getCampaignDetails)

app.get('/api/ws-connect', (req, res) => {
    // This is just for HTTP fallback, actual WS connection happens automatically
    res.status(426).send('Upgrade required'); 
  });
app.listen(port, () => {
    console.log(`app running on port ${port}`)
})

server.listen(process.env.SOCKET, () => {
    console.log(`Server running on port ${process.env.SOCKET}`);
  });

app.get('/test', (req, res) => {
    res.send({"message": "Hello world"})
})