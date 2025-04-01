const router = require('express').Router()
const { GroupFunding } = require('../models/GroupFundingSchema.model')

router.get("/", async (req, res) => {
    const {userId} = req.query
      console.log(userId)
      try{
        const groups = await GroupFunding.find({"createdBy": userId})
  
        if(!groups) {
          return res.status(404).json("No chamas found")
        }
  
        res.status(200).json(groups)
      } catch (err) {
        console.error(err)
          res.status(500).json("INternal server error")
      }
  });

  module.exports = router;