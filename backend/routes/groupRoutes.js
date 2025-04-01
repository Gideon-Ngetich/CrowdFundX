const router = require('express').Router();
const { ChamaGroup } = require('../models/ChamaGroups.model')
const { ChamaMember } = require('../models/ChamaMembers.model')
const { ChamaContribution } = require('../models/ChamaContribution.model')


router.get('/:id/cycle', async (req, res) => {
    try {
      const group = await ChamaGroup.findById(req.params.id);
      if (!group) return res.status(404).send('Group not found');
      
      res.json({
        currentCycle: group.currentCycle,
        cycleDuration: group.cycleDuration,
        nextCycleDate: calculateNextCycleDate(group)
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
});

  
  // Move to next cycle (admin only)
router.post('/:id/next-cycle', async (req, res) => {
    try {
      const group = await ChamaGroup.findById(req.params.id);
      if (!group) return res.status(404).send('Group not found');
  
      // Verify all members have contributed
      const memberCount = await ChamaMember.countDocuments({ group: group._id });
      const contributionCount = await ChamaContribution.countDocuments({
        group: group._id,
        cycleNumber: group.currentCycle,
        status: 'completed'
      });
  
      if (contributionCount < memberCount) {
        return res.status(400).json({
          error: 'Cannot advance cycle - pending contributions',
          members: memberCount,
          contributions: contributionCount
        });
      }
  
      // Update cycle
      group.currentCycle += 1;
      await group.save();
  
      res.json({
        message: `Advanced to cycle ${group.currentCycle}`,
        newCycle: group.currentCycle
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
  // Helper function to calculate next cycle date
  function calculateNextCycleDate(group) {
    const date = new Date(group.startDate);
    const cycles = group.currentCycle;
    
    if (group.cycleDuration === 'monthly') {
      date.setMonth(date.getMonth() + cycles);
    } else if (group.cycleDuration === 'weekly') {
      date.setDate(date.getDate() + (cycles * 7));
    }
    // Add other durations as needed
    
    return date;
  }

module.exports = router