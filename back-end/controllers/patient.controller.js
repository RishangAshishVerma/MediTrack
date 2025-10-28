import Patient from "../models/patient.model.js";
import genToken from "../utils/token.js";
import sendMail from "../utils/nodemailer.js";
import bcrypt from "bcrypt";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const signup = async (req, res) => {
    try {
        const {
            name, email, mobileNumber, password, role, dob, age,
            gender, bloodGroup, isDelete, EmergencyContact, PatientMedicalHistory,
        } = req.body;

        if (!name || !email || !mobileNumber || !password || !dob || !age || !gender || !bloodGroup) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory.",
            });
        }

        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(409).json({
                success: false,
                message: "User already exists. Please login or use a different email.",
            });
        }

        if (existingPatient?.isDelete) {
            return res.status(409).json({
                success: false,
                message: "User is already deleted. Please contact support for assistance.",
            });
        }

        const hashPassword = await bcrypt.hash(password, 8);


        const patient = await Patient.create({  
            name,
            email,
            mobileNumber,
            password: hashPassword,
            role,
            profileImage: "",
            dob,
            age,
            gender,
            bloodGroup,
            isDelete,
            EmergencyContact,
            PatientMedicalHistory,
        });

        const token = await genToken(patient._id);


        res.status(201).cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).json({
            success: true,
            message: "User created successfully.",
            data: patient,
        });

        (async () => {
            try {
                if (req.file?.path) {
                    const imageUrl = await uploadOnCloudinary(req.file.path);
                    if (imageUrl) {
                        await Patient.findByIdAndUpdate(patient._id, { profileImage: imageUrl });
                    }
                }
                await sendMail(
                    patient.email,
                    "Welcome to MediTrack!",
                    "Welcome to MediTrack — we're glad to have you on board.",
                    `<div style="font-family: Arial, sans-serif; color: #333;">
              <h2>Welcome to <span style="color:#007bff;">MediTrack</span> 🎉</h2>
              <p>Hi ${patient.name},</p>
              <p>Thank you for joining <b>MediTrack</b>. We’re excited to help you manage your health smarter and easier.</p>
              <p>Best regards,<br><b>The MediTrack Team</b></p>
          </div>`
                );
            } catch (Error) {
                console.error("Background task failed:", Error);
            }
        })();
    } catch (error) {
        return res.status(500).json({
            message: `Error while creating the user: ${error}`,
        });
    }
};
