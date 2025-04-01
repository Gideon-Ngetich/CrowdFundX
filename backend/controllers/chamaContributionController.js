const { getAccessToken, getTimestamp, generatePassword } = require('../utils/Mpesa.util');
const { ChamaContribution } = require('../models/ChamaContribution.model');
const { ChamaMember } = require('../models/ChamaMembers.model');
const { ChamaGroup } = require('../models/ChamaGroups.model');
const axios = require('axios')

exports.initiateContribution = async (req, res) => {
  try {
    const { memberId, groupId, amount } = req.body;

    // Get group with current cycle
    const group = await ChamaGroup.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Verify member belongs to group
    const member = await ChamaMember.findOne({
      _id: memberId,
      group: groupId
    });
    if (!member) return res.status(404).json({ error: 'Member not found in this group' });

    // Check if member already contributed this cycle
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

    // Initiate STK Push with current cycle
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

    // Save contribution with current cycle
    const contribution = new ChamaContribution({
      member: memberId,
      group: groupId,
      amount,
      cycleNumber: group.currentCycle, // This is the key addition
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