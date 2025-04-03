const { getAccessToken, getTimestamp, generatePassword } = require('../utils/Mpesa.util');
const { ChamaContribution } = require('../models/ChamaContribution.model');
const { ChamaMember } = require('../models/ChamaMembers.model');
const { ChamaGroup } = require('../models/ChamaGroups.model');
const { User } = require("../models/user.model")
const axios = require('axios')

exports.initiateContribution = async (req, res) => {
  try {
    const { memberId, groupId, amount, userId } = req.body;

    // Verify both user and member exist
    const [group, member, user] = await Promise.all([
      ChamaGroup.findById(groupId),
      ChamaMember.findOne({ _id: memberId, group: groupId }),
      User.findById(userId)
    ]);

    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!member) return res.status(404).json({ error: 'Member not found in this group' });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify member belongs to user
    if (member.user.toString() !== userId) {
      return res.status(403).json({ error: 'This member does not belong to you' });
    }

    // Check for existing contribution
    const existingContribution = await ChamaContribution.findOne({
      member: memberId,
      group: groupId,
      cycleNumber: group.currentCycle
    });

    if (existingContribution) {
      return res.status(400).json({
        error: 'Member already contributed this cycle',
        contribution: existingContribution
      });
    }

    // Initiate STK Push
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(
      process.env.MPESA_BUSINESS_SHORTCODE,
      process.env.MPESA_PASSKEY,
      timestamp
    );

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: member.phoneNumber,
        PartyB: process.env.MPESA_BUSINESS_SHORTCODE,
        PhoneNumber: member.phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `CHAMA-${groupId}-CYCLE-${group.currentCycle}`,
        TransactionDesc: `Cycle ${group.currentCycle} contribution`
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save contribution with both references
    const contribution = new ChamaContribution({
      member: memberId,
      user: userId,
      group: groupId,
      amount,
      cycleNumber: group.currentCycle,
      status: 'pending',
      requestId: response.data.CheckoutRequestID
    });
    await contribution.save();

    res.json({
      message: `Cycle ${group.currentCycle} payment initiated`,
      data: response.data
    });
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to initiate payment',
      details: error.response?.data || error.message
    });
  }
};