const router = require('express').Router()
const { GroupFunding } = require("../models/GroupFundingSchema.model")

router.post('/', async (req, res) => {
    const groupData = req.body

    try {
        const groupFunding = new GroupFunding({groupData})
        
        await groupFunding.save()

        res.status(200).json({message:"Group created successfully"})
    } catch (err) {
        console.error(err)
        res.status(500).json("Internal server error")
    }
})

module.exports = router