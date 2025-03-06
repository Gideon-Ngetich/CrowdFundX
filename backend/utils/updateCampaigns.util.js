const { CrowdFundingRecords } = require("../models/CrowdFundingRecords.model");
const { Crowdfunding } = require("../models/crowdFundingSchema.model");

const updateCampaignAmount = async (campaignId) => {
    try {
        // Aggregate total amount from all transactions for the campaign
        const totalAmount = await CrowdFundingRecords.aggregate([
            { $match: { campaignId: campaignId } },  // Get only this campaign's transactions
            { $group: { _id: null, total: { $sum: "$amount" } } }  // Sum all amounts
        ]);

        if (totalAmount.length > 0) {
            const newAmount = totalAmount[0].total;

            // Update the campaign's `currentAmount`
            const updatedCampaign = await Crowdfunding.findByIdAndUpdate(
                campaignId,
                { currentAmount: newAmount },
                { new: true }
            );

            console.log(`Campaign ${campaignId} updated. New amount: ${newAmount}`);
            return updatedCampaign;
        } else {
            console.log("No transactions found for this campaign.");
            return null;
        }
    } catch (error) {
        console.error("Error updating campaign amount:", error);
    }
};

module.exports = { updateCampaignAmount }