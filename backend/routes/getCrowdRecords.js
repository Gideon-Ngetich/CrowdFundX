const router = require('express').Router()
const { response } = require('express')
const { CrowdFundingRecords } = require('../models/CrowdFundingRecords.model')

router.get('/', async (req, res) => {
    try {
        const { cid } = req.query

        const response = await CrowdFundingRecords.find({ "campaignId": cid})
        res.status(200).json(response)
    } catch (err) {
        console.error(err)
        res.status(500).json("Internal server error")
    }
})

module.exports = router