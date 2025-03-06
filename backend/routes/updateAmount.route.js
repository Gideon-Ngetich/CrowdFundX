const express = require("express");
const router = express.Router();
const { updateCampaignAmount } = require('../utils/updateCampaigns.util');

router.post("/", async (req, res) => {
    try {
        const { campaignId } = req.query;
        const updatedCampaign = await updateCampaignAmount(campaignId);

        if (updatedCampaign) {
            res.json({ message: "Campaign amount updated", updatedCampaign });
        } else {
            res.status(404).json({ message: "No transactions found for this campaign" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating campaign", error: error.message });
    }
});

module.exports = router;
