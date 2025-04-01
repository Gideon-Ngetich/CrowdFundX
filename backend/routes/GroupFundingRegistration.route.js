const router = require('express').Router();
const { GroupFunding } = require("../models/GroupFundingSchema.model");
const { sendInviteEmail } = require("../utils/groupInvitationEmail.util");

// Create group with members
router.post('/groupfundingregistration', async (req, res) => {
  const { groupName, description, targetAmount, deadLine, mpesaAccount, members, userId } = req.body;

  // Input validation
  if (!groupName || !targetAmount || !members?.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Process members with invitation tokens
    const processedMembers = members.map(member => ({
      email: member.email,
      phoneNumber: member.phoneNumber,
      status: "Pending",
      inviteToken: require('crypto').randomBytes(20).toString('hex'),
      totalContributed: 0,
      transactions: []
    }));

    const groupFunding = new GroupFunding({
      groupName,
      description,
      targetAmount,
      deadLine,
      mpesaAccount,
      member: processedMembers,
      createdBy: userId
    });

    await groupFunding.save();

    // Send invites asynchronously (don't await to avoid blocking response)
    processedMembers.forEach(member => {
      sendInviteEmail(
        member.email,
        groupName,
        member.inviteToken,
        groupFunding._id
      ).catch(console.error);
    });

    res.status(201).json({ 
      success: true,
      groupId: groupFunding._id,
      message: "Group created successfully. Invites sent."
    });

  } catch (err) {
    console.error("Group creation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add new members via modal (new endpoint)
router.post('/:groupId/add-members', async (req, res) => {
  const { groupId } = req.params;
  console.log(groupId)
  const { newMembers } = req.body; // Array of {email, phoneNumber}

  try {
    const processedMembers = newMembers.map(member => ({
      email: member.email,
      phoneNumber: member.phoneNumber,
      status: "Pending",
      inviteToken: require('crypto').randomBytes(20).toString('hex'),
      totalContributed: 0,
      transactions: []
    }));

    const updatedGroup = await GroupFunding.findByIdAndUpdate(
      groupId,
      { $push: { member: { $each: processedMembers } }},
      { new: true }
    );

    // Send invites
    processedMembers.forEach(member => {
      sendInviteEmail(
        member.email,
        updatedGroup.groupName,
        member.inviteToken,
        groupId
      ).catch(console.error);
    });

    res.status(200).json({
      success: true,
      newCount: processedMembers.length,
      message: "Members added successfully"
    });

  } catch (err) {
    console.error("Add members error:", err);
    res.status(500).json({ error: "Failed to add members" });
  }
});

// Backend (after successful login)
router.get('/accept-invite/:token', async (req, res) => {
    const { token } = req.params;
    const userId = req.user.id; // From auth middleware
  
    await GroupFunding.updateOne(
      { "member.inviteToken": token },
      { 
        $set: { 
          "member.$.userId": userId,
          "member.$.status": "Accepted"
        }
      }
    );
    res.redirect("/group-joined");
  });

module.exports = router;