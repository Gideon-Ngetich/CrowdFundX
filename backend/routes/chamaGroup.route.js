const express = require("express");
const {ChamaGroup} = require("../models/ChamaGroups.model");
const router = express.Router();

router.post("/createchama", async (req, res) => {
    const { name, description, cycleAmount, cycleDuration, startDate, penaltyRate, currentCycle, rotationOrder, createdBy } = req.body;
    console.log(name, description, cycleAmount, cycleDuration, startDate, penaltyRate, currentCycle, rotationOrder, createdBy)
  try {
    const group = new ChamaGroup({name, description, cycleAmount, cycleDuration, startDate, penaltyRate, currentCycle, rotationOrder, createdBy})
    await group.save();
    res.status(201).json('Group created successfully');
  } catch (err) {
    console.error(err)
    res.status(400).send(err.message);
  }
});

router.get("/getchama", async (req, res) => {
  const {userId} = req.query
    try{
      const chamas = await ChamaGroup.find({"createdBy": userId})

      if(!chamas) {
        return res.status(404).json("No chamas found")
      }

      res.status(200).json(chamas)
    } catch (err) {
      console.error(err)
        res.status(500).json("INternal server error")
    }
});

router.get('/getchamabyid', async (req, res) => {
    const { id } = req.query;
    try {
      const chama = await ChamaGroup.findById({"_id": id})
      console.log({"chama": chama})
      if(!chama) {
        return res.status(404).json("Chama not found")
      }

      res.status(200).json(chama);
    } catch (err) {
      console.error(err)

      res.status(500).json("Internal server error")
    }
})

module.exports = router;