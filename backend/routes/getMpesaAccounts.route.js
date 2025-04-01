const router = require('express').Router()
const { MpesaAccountDetails } = require('../models/MpesaAccountDetails.model')

router.get('/', async (req, res) => {
    const { id } = req.query;
    console.log({'id2': id})

    try{ 
        const mpesaAccounts = await MpesaAccountDetails.find({"userId": id}, {_id: 1, AccountName: 1, businessShortCode: 1})

        if(!mpesaAccounts) {
            return res.status(404).json({success: false, message: "No mpesa accounts found"})
        }
        res.status(200).json({success: true, mpesaAccounts})
    } catch (err) {
        res.status(500).json({succes: false, message: "Internal server error"})
    }
})

module.exports = router;