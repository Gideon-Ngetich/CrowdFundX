const express = require("express");
const router = express.Router();
const { CrowdFundingRecords } = require("../models/CrowdFundingRecords.model");

router.post("/", async (req, res) => {
    try {
        const { Body } = req.body;
        const callbackData = Body.stkCallback;

        if (callbackData.ResultCode === 0) {
            const transaction = await CrowdFundingRecords.findOneAndUpdate(
                { transactionId: callbackData.CheckoutRequestID },
                { transactionId: callbackData.MpesaReceiptNumber },
                { new: true }
            );

            if (transaction) {
                console.log("Transaction updated:", transaction);
            } else {
                console.error("Transaction not found.");
            }
        } else {
            console.error("STK Push Failed:", callbackData.ResultDesc);
        }

        res.status(200).json({ message: "Callback received." });
    } catch (error) {
        console.error("Callback Error:", error);
        res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
});

module.exports = router;
