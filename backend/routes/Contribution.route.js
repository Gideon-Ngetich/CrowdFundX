const express = require('express');
const router = express.Router();
const { initiateContribution } = require('../controllers/chamaContributionController');
const {ChamaContribution} = require('../models/ChamaContribution.model');


// Initiate contribution payment
router.post('/chamastk', initiateContribution);

// Get all contributions for a group
router.get('/chamacontribution', async (req, res) => {
  const { id } = req.query
  try {
    const contributions = await ChamaContribution.find({ 
      group: id 
    }).populate('member');
    res.json(contributions.member);
    console.log({"Contributions": contributions})
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



module.exports = router;