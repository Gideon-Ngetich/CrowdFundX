const mongoose = require('mongoose')

const groupFundingSchema = new mongoose.Schema({
    groupName: {
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
        type: Date
    }, 
    mpesaAccount : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'mpesaAccountDetails'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    member: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            email: { type: String, required: true},
            phoneNumber: { type: String},
            totalContributed: { type: Number, default: 0},
            inviteToken: { type: String},
            transactions: [
                {
                    transactionId: String,
                    amount: Number,
                    createdAt: { type: Date, default: Date.now}
                }
            ],
            status: {
                type: String,
                enum: [ "Pending", "Accepted", "Declined"],
                default: "Pending"
            },
            default: []
        },
    ],
    createdAt: { type: Date, default: Date.now}
    
})

const GroupFunding = mongoose.model("Group Funding Campaigns", groupFundingSchema)

module.exports = { GroupFunding }