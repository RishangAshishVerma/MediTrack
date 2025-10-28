import mongoose from "mongoose";

const PatientEmergencyContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    mobileNumber: {
        type: Number,
        required: true,
    },

    relations: {
        type: String,
        required: true,
        enum: ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Guardian'],
    },

}, { timestamps: true });

const PatientEmergencyContact = mongoose.model("PatientEmergencyContact", PatientEmergencyContactSchema);
export default PatientEmergencyContact;

