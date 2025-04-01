const router = require('express').Router();
const { ChamaMember } = require("../models/ChamaMembers.model"); 
const {ChamaGroup} = require("../models/ChamaGroups.model");
const {ChamaContribution} = require('../models/ChamaContribution.model');


router.post('/:id/process-payout', async (req, res) => {

  try {
    const group = await ChamaGroup.findById(req.params.id)
      .populate('rotationOrder');

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Verify all members have contributed
    const memberCount = await ChamaMember.countDocuments({ group: group._id });
    const contributionCount = await ChamaContribution.countDocuments({
      group: group._id,
      cycleNumber: group.currentCycle,
      status: 'completed'
    });

    if (contributionCount < memberCount) {
      console.error('Cannot process payout - pending contributions')
      return res.status(400).json({
        success: false,
        error: 'Cannot process payout - pending contributions',
        details: {
          required: memberCount,
          received: contributionCount
        }
      });
    }

    // Determine recipient
    const recipientIndex = group.currentRecipientIndex % group.rotationOrder.length;
    const recipient = group.rotationOrder[recipientIndex];

    if (!recipient) {
      return res.status(400).json({
        success: false,
        error: 'No valid recipient found in rotation order'
      });
    }

    // Calculate payout amount (total contributions for this cycle)
    const contributions = await ChamaContribution.find({
      group: group._id,
      cycleNumber: group.currentCycle
    });
    const payoutAmount = contributions.reduce((sum, c) => sum + c.amount, 0);

    // Record payout (in a real system, you'd integrate with M-Pesa here)
    const payoutRecord = {
      member: recipient._id,
      cycleNumber: group.currentCycle,
      amount: payoutAmount,
      payoutDate: new Date()
    };

    // Update group state
    group.previousRecipients.push(payoutRecord);
    group.currentRecipientIndex += 1;
    group.currentCycle += 1;
    await group.save();

    // Update member record
    await ChamaMember.findByIdAndUpdate(recipient._id, {
      $push: {
        payouts: payoutRecord
      },
      hasReceived: true,
      lastReceivedCycle: group.currentCycle - 1 // Previous cycle
    });

    res.json({
      success: true,
      message: `Payout processed successfully for cycle ${group.currentCycle - 1}`,
      data: {
        recipient: {
          _id: recipient._id,
          name: recipient.user.name,
          phoneNumber: recipient.phoneNumber
        },
        amount: payoutAmount,
        nextRecipient: group.rotationOrder[(recipientIndex + 1) % group.rotationOrder.length]
      }
    });

  } catch (err) {
    console.error('Payout processing error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while processing payout'
    });
  }
});

router.get('/:id/payout-status', async (req, res) => {
  try {
    const group = await ChamaGroup.findById(req.params.id)
      .populate('rotationOrder', 'user phoneNumber')
      .populate('previousRecipients.member', 'user phoneNumber');
    
    if (!group) {
      return res.status(404).json({ 
        success: false,
        error: 'Group not found' 
      });
    }

    // Determine next recipient
    const nextRecipientIndex = group.currentRecipientIndex % group.rotationOrder.length;
    const nextRecipient = group.rotationOrder[nextRecipientIndex];

    res.json({
      success: true,
      data: {
        currentCycle: group.currentCycle,
        nextRecipient: nextRecipient || null,
        rotationOrder: group.rotationOrder,
        previousRecipients: group.previousRecipients,
        payoutHistory: group.previousRecipients
          .sort((a, b) => b.cycleNumber - a.cycleNumber)
      }
    });
    
  } catch (err) {
    console.error('Error fetching payout status:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching payout status' 
    });
  }
});

module.exports = router