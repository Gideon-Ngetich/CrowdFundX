const router = require('express').Router()
const { MpesaAccountDetails } = require('../models/MpesaAccountDetails.model')

router.get('/', async (req, res) => {

    const { uid } = req.query
    console.log(uid)

    try{
        const response = await MpesaAccountDetails.find({"userId": uid}, {AccountName: 1, businessShortCode: 1})

        res.status(200).json(response)
    } catch (err) {
        res.status(400).json("Internal server error")
    }
})

module.exports = router;