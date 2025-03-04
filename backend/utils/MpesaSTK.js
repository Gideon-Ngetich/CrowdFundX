const { Crowdfunding } = require('../models/crowdFundingSchema.model')
const { MpesaAccountDetails } = require("../models/MpesaAccountDetails.model")

async function getAccountDetails(campaignId) {
    return await Crowdfunding.findOne({mpesaAccount})
}