const express = require('express');
const router = express.Router();
const { initiateContribution } = require('../controllers/chamaContributionController');
const {ChamaContribution} = require('../models/ChamaContribution.model');
const { ChamaMember } = require('../models/ChamaMembers.model')


// Initiate contribution payment
router.post('/chamastk', initiateContribution);

// Get all contributions for a group
router.get('/chamacontribution', async (req, res) => {
  const { id } = req.query;
  try {
    const contributions = await ChamaContribution.find({ group: id })
      .populate('member')
      .populate('user', 'firstName lastName phoneNumber photo');
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify a contribution status
router.get('/:id/status', async (req, res) => {
  try {
    const contribution = await ChamaContribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    res.json({ status: contribution.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// routes/memberRoutes.js

// Add this new endpoint
router.get('/find-member', async (req, res) => {
  try {
    const { userId, groupId } = req.query;
    
    const member = await ChamaMember.findOne({ 
      user: userId, 
      group: groupId 
    })
    .populate('user', 'firstName lastName phoneNumber')
    .populate('group', 'name cycleAmount');
    
    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found in this group' 
      });
    }

    console.log({"Member": member})
    
    res.json({
      success: true,
      data: member
    });
    
  } catch (err) {
    console.error(err)
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});


module.exports = router;