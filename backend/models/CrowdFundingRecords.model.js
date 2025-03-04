const mongoose = require('mongoose')

const CrowdTransactionSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CrowdFunding',
        required: true
    },
    phoneNumber: String,
    amount: Number,
    transactionId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const CrowdFundingRecords = mongoose.model('CrowdFunding Transaction Records', CrowdTransactionSchema)

module.exports = { CrowdFundingRecords };