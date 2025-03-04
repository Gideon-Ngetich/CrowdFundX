const mongoose = require('mongoose')

const mpesaAccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    AccountName: String,
    businessShortCode: String,
    consumerKey: String,
    consumerSecret: String,
    passkey: String,
    callbackURL: String,
    createdAt: { type: Date, default: Date.now}
})

const MpesaAccountDetails = mongoose.model('MpesaAccountDetails', mpesaAccountSchema)

module.exports = { MpesaAccountDetails }