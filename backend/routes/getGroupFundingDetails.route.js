const router = require('express').Router()
const { GroupFunding } = require('../models/GroupFundingSchema.model')

router.get('/', async (req, res) => {
    const { id } = req.query;

    try {

    
        const campaign = await GroupFunding.findOne({"_id": id})

        if(!campaign) {
            return res.status(404).json({success: false, message: 'Campaign not found'})
        }

        res.status(200).json(campaign)
    } catch (err) {
        res.status(500).json('Internal server error')
    }
})

module.exports = router;