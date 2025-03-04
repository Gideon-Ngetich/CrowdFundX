const axios = require("axios");
const moment = require("moment");
const router = require("express").Router();
const { Crowdfunding } = require("../models/crowdFundingSchema.model");
const { MpesaAccountDetails } = require("../models/MpesaAccountDetails.model");
const { CrowdFundingRecords } = require("../models/CrowdFundingRecords.model");

// Safaricom OAuth Token Generation
const getAccessToken = async (consumerKey, consumerSecret) => {
    console.log(consumerKey)
    console.log(consumerSecret)
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    try {
        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: { Authorization: `Basic ${auth}` },
        });
        return response.data.access_token;
    } catch (error) {
        console.error("M-Pesa OAuth Error:", error.response?.data || error.message);
        throw new Error("Failed to generate M-Pesa access token.");
    }
};

// STK Push Route
router.post("/", async (req, res) => {
    try {
        const { campaignId, phoneNumber, amount } = req.body;

        // Validate input
        if (!campaignId || !phoneNumber || !amount) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Fetch campaign details
        const campaign = await Crowdfunding.findById(campaignId).populate("mpesaAccount");
        if (!campaign || !campaign.mpesaAccount) {
            return res.status(404).json({ message: "Campaign or M-Pesa details not found." });
        }

        const mpesaDetails = campaign.mpesaAccount;

        // Generate Timestamp & Password
        const timestamp = moment().format("YYYYMMDDHHmmss");
        const password = Buffer.from(mpesaDetails.businessShortCode + mpesaDetails.passkey + timestamp).toString("base64");

        // Generate M-Pesa Access Token
        const accessToken = await getAccessToken(mpesaDetails.consumerKey, mpesaDetails.consumerSecret);

        // STK Push API Request
        const stkPushData = {
            BusinessShortCode: mpesaDetails.businessShortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: mpesaDetails.businessShortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: mpesaDetails.callbackURL,
            AccountReference: campaign.campaignTitle,
            TransactionDesc: `Contribution to ${campaign.campaignTitle}`,
        };

        const stkResponse = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", stkPushData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (stkResponse.data.ResponseCode === "0") {
            // Record transaction
            const transaction = new CrowdFundingRecords({
                campaignId,
                phoneNumber,
                amount,
                transactionId: stkResponse.data.CheckoutRequestID,
            });

            await transaction.save();

            return res.status(200).json({
                message: "STK Push request sent successfully.",
                checkoutRequestID: stkResponse.data.CheckoutRequestID,
            });
        } else {
            return res.status(400).json({ message: "STK Push failed.", response: stkResponse.data });
        }
    } catch (error) {
        console.error("STK Push Error:", error);
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
});

module.exports = router;
