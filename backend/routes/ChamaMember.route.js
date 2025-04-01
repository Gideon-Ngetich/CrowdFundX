const express = require("express");
const { ChamaMember } = require("../models/ChamaMembers.model");
const {ChamaGroup} = require("../models/ChamaGroups.model");
const { ChamaContribution } = require('../models/ChamaContribution.model')
const router = express.Router();

// Add member to group
router.post("/chamamember", async (req, res) => {
  try {
    const { user, group, phoneNumber } = req.body;
    
    // Verify group exists
    const groupExists = await ChamaGroup.findById(group);
    if (!groupExists) return res.status(404).send("Group not found");

    const member = new ChamaMember({ user, group, phoneNumber });
    await member.save();

    // Add to group's rotation order if not already present
    if (!groupExists.rotationOrder.includes(member._id)) {
      groupExists.rotationOrder.push(member._id);
      await groupExists.save();
    }

    res.status(201).send(member);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all members in a group
router.get("/group", async (req, res) => {
  const { id } = req.query

  try {
    const members = await ChamaMember.find({ "group": id })
      .populate("user", "name email phoneNumber");
    res.send(members);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// In your memberRoutes.js
router.get('/:groupId/defaulters', async (req, res) => {
    const group = await ChamaGroup.findById(req.params.groupId);
    const paidMembers = await ChamaContribution.distinct('member', {
      group: group._id,
      cycleNumber: group.currentCycle
    });
    
    const defaulters = await ChamaMember.find({
      group: group._id,
      _id: { $nin: paidMembers }
    }).populate('user', 'name phoneNumber');
  
    res.json(defaulters);
  });

module.exports = router;