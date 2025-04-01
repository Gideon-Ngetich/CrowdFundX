const express = require("express");
const {Penalty} = require("../models/Penalty.model");
const {ChamaContribution} = require("../models/ChamaContribution.model");
const {ChamaGroup} = require("../models/ChamaGroups.model");
const router = express.Router();

// Calculate and assign penalties
router.post("/calculate/:groupId", async (req, res) => {
  try {
    const group = await ChamaGroup.findById(req.params.groupId);
    if (!group) return res.status(404).send("Group not found");

    // Get all members who haven't contributed in current cycle
    const contributors = await ChamaContribution.find({
      group: group._id,
      cycleNumber: group.currentCycle
    }).distinct("member");

    const defaulters = await Member.find({
      group: group._id,
      _id: { $nin: contributors }
    });

    // Create penalty records
    const penaltyAmount = group.cycleAmount * group.penaltyRate;
    const penalties = await Promise.all(
      defaulters.map(async (defaulter) => {
        const penalty = new Penalty({
          member: defaulter._id,
          group: group._id,
          amount: penaltyAmount,
          cycleNumber: group.currentCycle
        });
        return await penalty.save();
      })
    );

    res.send(penalties);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;