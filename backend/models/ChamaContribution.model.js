const mongoose = require("mongoose");

const ContributionSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "ChamaMember", required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "ChamaGroup", required: true },
  amount: { type: Number, required: true },
  mpesaCode: { type: String },
  cycleNumber: { type: Number, required: true },
  isPenalty: { type: Boolean, default: false },
}, { timestamps: true });

const ChamaContribution = mongoose.model("ChamaContribution", ContributionSchema);

module.exports = { ChamaContribution }