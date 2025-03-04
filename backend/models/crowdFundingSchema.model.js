const mongoose = require('mongoose')

const crowdFundingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    campaignTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    deadLine: {
        type: Date,
    },
    mpesaAccount: {
        type: mongoose.Schema.Types.ObjectId, ref: "MpesaAccountDetails"
    }

})

const Crowdfunding = mongoose.model('CrowdFunding', crowdFundingSchema)

module.exports = { Crowdfunding }