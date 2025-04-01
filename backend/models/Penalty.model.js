const mongoose = require("mongoose");

const PenaltySchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "ChamaMember", required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "ChamaGroup", required: true },
  amount: { type: Number, required: true },
  mpesaCode: { type: String }, // M-Pesa transaction ID
  cycleNumber: { type: Number, required: true },
  paid: { type: Boolean, default: false },
}, { timestamps: true });

const Penalty =  mongoose.model("Penalty", PenaltySchema);

module.exports = { Penalty };