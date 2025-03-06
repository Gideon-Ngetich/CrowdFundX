const router = require('express').Router()
const { Crowdfunding } = require('../models/crowdFundingSchema.model')

router.get('/', async (req, res) => {
    const { code } = req.query

    try{

        console.log(code)
        if(!code) {
           return res.status(404).json({message: "user not found"})
        }

        const results = await Crowdfunding.find({ "userId": code})

        if(results.length === 0) {
            res.status(404).json({message: "No campaigns found"})
            return
        }

        res.status(200).json(results)
    } catch (err) {
        console.error(err)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router;