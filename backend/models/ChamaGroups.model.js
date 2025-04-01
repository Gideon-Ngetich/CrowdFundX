const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  cycleAmount: { type: Number, required: true }, 
  cycleDuration: { type: String, default: "monthly" },
  startDate: { type: Date, default: Date.now },
  penaltyRate: { type: Number, default: 0 },
  currentCycle: { type: Number, default: 1 },
  rotationOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChamaMember" }], default: [],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rotationOrder: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ChamaMember' 
  }],
  currentRecipientIndex: { 
    type: Number, 
    default: 0 
  },
  previousRecipients: [{
    member: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'ChamaMember' 
    },
    cycleNumber: Number,
    amount: Number,
    payoutDate: Date
  }]
}, { timestamps: true });

const ChamaGroup = mongoose.model("ChamaGroup", GroupSchema);

module.exports = { ChamaGroup }