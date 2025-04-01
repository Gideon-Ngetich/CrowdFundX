const mongoose = require("mongoose");


const PayoutSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "ChamaGroup", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "ChamaMember", required: true },
  amount: { type: Number, required: true },
  mpesaCode: { type: String },
  cycleNumber: { type: Number, required: true },
}, { timestamps: true });

const Payout = mongoose.model("Payout", PayoutSchema);

module.exports = { Payout };