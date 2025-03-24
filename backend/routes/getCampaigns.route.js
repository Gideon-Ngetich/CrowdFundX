const router = require('express').Router()
const { Crowdfunding } = require('../models/crowdFundingSchema.model')

router.get('/', async (req, res) => {
    try {
        const response = await Crowdfunding.find()

        res.status(200).json(response)
    } catch (err) {
        res.status(400).json("Internal server error")
    }
})

module.exports = router;