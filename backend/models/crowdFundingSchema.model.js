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
    },
    deadLine: {
        type: Date,
    },
    mpesaAccount: {
        type: mongoose.Schema.Types.ObjectId, ref: "MpesaAccountDetails"
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

})

const Crowdfunding = mongoose.model('CrowdFunding', crowdFundingSchema)

module.exports = { Crowdfunding }