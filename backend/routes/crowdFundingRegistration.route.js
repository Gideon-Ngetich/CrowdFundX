const router = require("express").Router()
const { Crowdfunding } = require("../models/crowdFundingSchema.model")

router.post('/', async (req, res) => {
    const {userId, campaignTitle, description, targetAmount, currentAmount, deadLine, mpesaAccount } = req.body;

    
    try{ 
        const campaign = new Crowdfunding({
            userId, campaignTitle, description, targetAmount, currentAmount, deadLine, mpesaAccount: mpesaAccount
        })

       await campaign.save()

       res.status(201).json({"Message": "Campaign created successfully"})
    } catch (err) {
        console.error(err)
        res.status(500).json({"message": "Internal server error"})
    }

})

module.exports = router