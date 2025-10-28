import mongoose from "mongoose";

const medicalHistorySchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient", 
            required: true,
        },

        allergies: [
            {
                name: { type: String, required: true },
                reaction: { type: String },
                severity: { type: String, enum: ["mild", "moderate", "severe"] },
            },
        ],

        medications: [
            {
                name: { type: String, required: true },
                dosage: { type: String },
                frequency: { type: String },
                startDate: { type: Date },
                endDate: { type: Date },
            },
        ],

        surgeries: [
            {
                procedure: { type: String, required: true },
                date: { type: Date },
                hospital: { type: String },
                outcome: { type: String },
            },
        ],

        familyHistory: {
            type: String,
        },

        immunizations: [
            {
                name: { type: String },
                date: { type: Date },
            },
        ],

        lifestyle: {
            smoking: { type: Boolean, default: false },
            alcohol: { type: Boolean, default: false },
            exerciseFrequency: { type: String },
            diet: { type: String },
        },

        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

const PatientMedicalHistory = mongoose.model("PatientMedicalHistory", medicalHistorySchema);

export default PatientMedicalHistory;