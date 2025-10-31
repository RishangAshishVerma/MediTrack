import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    mobileNumber: {
        type: Number,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['Patient'],
        default: "Patient"
    },

    profileImage: {
        type: String,
        required: true,
    },

    dob: {
        type: String,
        required: true,
    },

    age: {
        type: Number,
        required: true,
        min: 0,
        max: 120,
    },

    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'],
    },

    bloodGroup: {
        type: String,
        required: true,
        enum: [
            'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
            'A1+', 'A1-', 'A2+', 'A2-', 'A1B+', 'A1B-', 'A2B+', 'A2B-',
            'Bombay', 'Rh-null',
        ],
    },

    isDeleted:{
        type:Boolean,
        default:false
    },

    EmergencyContact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PatientEmergencyContact",
    },

    PatientMedicalHistory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PatientMedicalHistory",
    },

}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
