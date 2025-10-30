import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  requestedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  status: {
    type: String,
    enum: ['accepted', 'pending', 'rejected'],
    default: 'pending'
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }
}, { timestamps: true });

 const VerificationRequest = mongoose.model("VerificationRequest", verificationSchema);

 export default VerificationRequest
