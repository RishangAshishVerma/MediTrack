import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
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
        enum: ['Admin'],
        default: "Admin"
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

    isDeleted:{
        type:Boolean,
        default:false
    },

}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
