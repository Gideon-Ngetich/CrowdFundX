const router = require('express').Router()
const { MpesaAccountDetails } = require("../models/MpesaAccountDetails.model")


router.post('/', async (req, res) => {
    const { userId, AccountName, businessShortCode, consumerKey, consumerSecret, passkey } = req.body
    const callbackURL = 'https://crowdfundx.onrender.com/api/mpesa-callback'

    try{
        const accountDetails = new MpesaAccountDetails({
            userId, AccountName, businessShortCode, consumerKey, consumerSecret, passkey, callbackURL
        })

        
        await accountDetails.save()

        res.status(201).json({success: true, message: "Mpesa account details added successfully"})
    } catch (err) {
        console.error(err)
        res.status(500).json({"Message": "Internal server error"})
    }
})

module.exports = router;
