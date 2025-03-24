const axios = require("axios");
const moment = require("moment");
const {Crowdfunding} = require("../models/crowdFundingSchema.model");
const {CrowdFundingRecords} = require("../models/CrowdFundingRecords.model");
const { MpesaAccountDetails } = require("../models/MpesaAccountDetails.model");

const router = require('express').Router();

// Generate M-Pesa Access Token
const getAccessToken = async (consumerKey, consumerSecret) => {
    console.log("Consumer Key:", consumerKey);
    console.log("Consumer Secret:", consumerSecret);

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
router.post("/stkpush", async (req, res) => {
    try {
        const { campaignId, phoneNumber, amount  } = req.body;
        if (!phoneNumber || !amount || !campaignId) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const campaign = await Crowdfunding.findById(campaignId).populate("mpesaAccount")
        if (!campaign || !campaign.mpesaAccount) {
            return res.status(404).json({ message: "Campaign not found." });
        }

        const mpesaDetails =campaign.mpesaAccount
        console.log(mpesaDetails)
        const timestamp = moment().format("YYYYMMDDHHmmss");
        const password = Buffer.from(mpesaDetails.businessShortCode + mpesaDetails.passkey + timestamp).toString("base64");

        const accessToken = await getAccessToken(mpesaDetails.consumerKey, mpesaDetails.consumerSecret);

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
            TransactionDesc: `Contribution to ${campaign.campaignTitle}`
        };

        const stkResponse = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            stkPushData,
            { 
                headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                "Content-type": "application/json"
            }
        );

        if (stkResponse.data.ResponseCode === "0") {
            const transaction = new CrowdFundingRecords({
                phoneNumber,
                amount,
                campaignId,
                transactionId: stkResponse.data.CheckoutRequestID
            });
            await transaction.save();

            return res.status(200).json({ message: "STK Push request sent.", checkoutRequestID: stkResponse.data.CheckoutRequestID });
        } else {
            return res.status(400).json({ message: "STK Push failed.", response: stkResponse.data });
        }
    } catch (error) {
        console.error("STK Push Error:", error);
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
});

// M-Pesa Callback Route
router.post("/callback", async (req, res) => {
    console.log("callback hit")
    try {
        const { Body } = req.body;
        if (!Body || !Body.stkCallback) {
            return res.status(400).json({ message: "Invalid callback format." });
        }

        const callbackData = Body.stkCallback;
        console.log("STK Callback Data:", callbackData);

        if (callbackData.ResultCode === 0) {
            const transaction = await CrowdFundingRecords.findOne({ transactionId: callbackData.CheckoutRequestID });
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found." });
            }

            const campaign = await Crowdfunding.findById(transaction.campaignId);
            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found." });
            }

            const callbackAmount = callbackData.CallbackMetadata?.Item.find(i => i.Name === "Amount")?.Value || 0;
            if (callbackAmount <= 0) {
                return res.status(400).json({ message: "Invalid amount received." });
            }

            transaction.status = "Completed";
            await transaction.save();

            campaign.currentAmount += callbackAmount;
            await campaign.save();

            res.status(200).json({ message: "Callback processed successfully." });

        } else {
            res.status(400).json({ message: "STK Push Failed.", reason: callbackData.ResultDesc });
        }
    } catch (error) {
        console.error("Callback Error:", error);
        res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
});

module.exports = router;
