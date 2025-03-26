const router = require('express').Router()
const { GroupFunding } = require("../models/GroupFundingSchema.model")

router.post('/', async (req, res) => {
    const  { groupName, description, targetAmount, deadline, mpesaAccount, member, createdBy}= req.body
    console.log(groupName, description, targetAmount, deadline, mpesaAccount, member)

    try {
        const groupFunding = new GroupFunding({groupName, description, targetAmount, deadline, mpesaAccount, member, createdBy})
        
        await groupFunding.save()

        res.status(200).json({message:"Group created successfully"})
    } catch (err) {
        console.error(err)
        res.status(500).json("Internal server error")
    }
})

module.exports = router