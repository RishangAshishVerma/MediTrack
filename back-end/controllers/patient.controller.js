import Patient from "../models/patient.model.js";
import genToken from "../utils/token.js";
import sendMail from "../utils/nodemailer.js";
import bcrypt from "bcrypt";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const signUp = async (req, res) => {
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
        console.error("Error while creating the user:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the user. Please try again later.",
        });
    }
};


export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory.",
            });
        }

        const existingPatient = await Patient.findOne({ email });

        if (!existingPatient) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }


        if (existingPatient?.isDelete) {
            return res.status(409).json({
                success: false,
                message: "User is already deleted. Please contact support for assistance.",
            });
        }

        let isMatch = await bcrypt.compare(password, existingPatient.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = await genToken(existingPatient._id);


        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).json({
            success: true,
            message: "User login successfully.",
            data: existingPatient,
        });

    } catch (error) {
        console.error("Error while logging in the user:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while logging in. Please try again later.",
        });
    }

}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({
            success: true,
            message: "Logout successful. See you again soon!",
        });

    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while logging out. Please try again later.",
        });
    }
};



export const deleteAccount = async (req, res) => {
  try {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No valid token found.",
      });
    }

    const user = await Patient.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Mark user as deleted
    if (!user.isDeleted) {
      user.isDeleted = true;
      await user.save();
    }

    // Clear authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    // Send account deletion email asynchronously (non-blocking)
    (async () => {
      try {
        await sendMail(
          user.email,
          "Your MediTrack Account Has Been Deleted",
          "Your MediTrack account has been successfully deleted.",
          `<div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color:#dc3545;">MediTrack Account Deleted ❌</h2>
            <p>Hi ${user.name},</p>
            <p>We wanted to let you know that your <b>MediTrack</b> account has been permanently deleted as per your request or due to inactivity.</p>
            <p>If you believe this was a mistake or wish to rejoin, you can always create a new account anytime.</p>
            <p>Thank you for being part of MediTrack.<br><b>The MediTrack Team</b></p>
          </div>`
        );
      } catch (err) {
        console.error("Failed to send account deletion email:", err.message);
      }
    })();

    return res.status(200).json({
      success: true,
      message: "Your account has been deleted successfully.",
    });
  } catch (error) {
    console.error("Error while deleting account:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while deleting your account.",
    });
  }
};
