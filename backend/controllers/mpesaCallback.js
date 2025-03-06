const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { CrowdFundingRecords } = require("../models/CrowdFundingRecords.model");
const { Crowdfunding } = require('../models/crowdFundingSchema.model');

router.post("/", async (req, res) => {
    console.log("Received MPesa Callback:", req.body);

    try {
        const { Body } = req.body;
        if (!Body || !Body.stkCallback) {
            console.error("Invalid callback format.");
            return res.status(400).json({ message: "Invalid callback format." });
        }

        const callbackData = Body.stkCallback;
        console.log("STK Callback Data:", callbackData);

        if (callbackData.ResultCode === 0) {
            console.log("Successful STK Response received");

            // Find the transaction record
            const transaction = await CrowdFundingRecords.findOne({
                transactionId: callbackData.CheckoutRequestID
            });

            if (!transaction) {
                console.error("Transaction not found.");
                return res.status(404).json({ message: "Transaction not found." });
            }

            console.log("Transaction found:", transaction);

            // Update transactionId with MpesaReceiptNumber
            transaction.transactionId = callbackData.MpesaReceiptNumber;
            await transaction.save();

            console.log("Transaction updated successfully:", transaction);

            // Validate campaignId and amount
            res.status(200).json({ message: "Callback processed successfully." });

        } else {
            console.error("STK Push Failed:", callbackData.ResultDesc);
            res.status(400).json({ message: "STK Push Failed.", reason: callbackData.ResultDesc });
        }
    } catch (error) {
        console.error("Callback Error:", error);
        res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
});

module.exports = router;
