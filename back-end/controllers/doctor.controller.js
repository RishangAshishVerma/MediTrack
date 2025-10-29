import bcrypt from "bcryptjs";
import Doctor from "../models/doctor.model.js";
import genToken from "../utils/token.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import sendMail from "../utils/nodemailer.js";
export const signUp = async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNumber,
      password,
      profileImage,
      specialization,
      category,
      qualification,
      experience,
      about,
      fees,
      hospitalInfo,
      availabilityRange,
      dailyTimeRange,
      slotDurationMinutes,
    } = req.body;

   
    if (!name || !email || !mobileNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }


    const existingDoctor = await Doctor.findOne({ email });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists pls login .",
      });
    }

    if (existingDoctor?.isDelete) {
      return res.status(409).json({
        success: false,
        message:
          "User account has been deleted. Please contact support for assistance.",
      });
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newDoctor = await Doctor.create({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      profileImage,
      specialization,
      category,
      qualification,
      experience,
      about,
      fees,
      hospitalInfo,
      availabilityRange,
      dailyTimeRange,
      slotDurationMinutes,
    });

   
    const token = genToken(newDoctor._id);


    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        success: true,
        message: "Doctor registered successfully.",
        data: newDoctor,
      });

   
    (async () => {
      try {
    
        if (req.file?.path) {
          const imageUrl = await uploadOnCloudinary(req.file.path);
          if (imageUrl) {
            await Doctor.findByIdAndUpdate(newDoctor._id, {profileImage: imageUrl,});
          }
        }

        await sendMail(
          newDoctor.email,
          "Welcome to MediTrack!",
          "Welcome to MediTrack — we're glad to have you on board.",
          `<div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Welcome to <span style="color:#007bff;">MediTrack</span> 🎉</h2>
            <p>Hi ${newDoctor.name},</p>
            <p>Thank you for joining <b>MediTrack</b>. We’re excited to help you manage your health smarter and easier.</p>
            <p>Best regards,<br><b>The MediTrack Team</b></p>
          </div>`
        );
      } catch (error) {
        console.error("Background task failed:", error);
      }
    })();
  } catch (error) {
    console.error("Error while creating doctor:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
