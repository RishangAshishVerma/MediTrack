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
  },

  aadhaarCard: {
    type: String,
  },
  
  passport: {
    type: String,
  },

  drivingLicence: {
    type: String,
  },

  PANCard: {
    type: String,
  },

  degreeCertificate: {
    type: String,
  },

  schoolLevelCertificates: {
    type: String,
  },

}, { timestamps: true });

const VerificationRequest = mongoose.model("VerificationRequest", verificationSchema);

export default VerificationRequest;
