const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "ChamaGroup", required: true },
  hasReceived: { type: Boolean, default: false },
  lastReceivedCycle: Number,
  payouts: [{
    cycleNumber: Number,
    amount: Number,
    payoutDate: Date
  }],
  receiveCycle: { type: Number }, 
  phoneNumber: { type: String, required: true },
}, { timestamps: true });

const ChamaMember = mongoose.model("ChamaMember", MemberSchema);

module.exports = { ChamaMember };