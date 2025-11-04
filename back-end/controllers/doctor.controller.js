import bcrypt from "bcryptjs";
import Doctor from "../models/doctor.model.js";
import genToken from "../utils/token.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import sendMail from "../utils/nodemailer.js";
import VerificationRequest from "../models/verification.model.js";
import Admin from "../models/admin.model.js";


export const signUp = async (req, res) => {
  try {
    const {
      name, email, mobileNumber, password, profileImage,
      specialization, category, qualification, experience, about, fees,
      hospitalInfo, availabilityRange, dailyTimeRange, slotDurationMinutes, role } = req.body;


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
      role: Doctor,
    });


    let token = genToken(newDoctor._id, newDoctor.role);


    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
            await Doctor.findByIdAndUpdate(newDoctor._id, { profileImage: imageUrl, });
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

export const signIn = async (req, res) => {
  try {
    const { name, email, password, } = req.body
    console.log(req.body);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }
    const existingDoctor = await Doctor.findOne({ email }).select("-password");;

    if (existingDoctor?.isDelete) {
      return res.status(409).json({
        success: false,
        message:
          "User account has been deleted. Please contact support for assistance.",
      });
    }

    let isMatch = bcrypt.compare(password, existingDoctor.password)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    let token = genToken(existingDoctor._id, existingDoctor.role)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({
      success: true,
      message: "User login successfully.",
      data: existingDoctor,
    });
  } catch (error) {
    console.error("Error while logging in the user:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in. Please try again later.",
    });
  }
};

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

    const user = await Doctor.findById(userId).select("-password");;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isDelete) {
      user.isDelete = true;
      await user.save();
    }


    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    (async () => {
      try {
        await sendMail(
          user.email,
          "Your MediTrack Account Has Been Deleted",
          "Your MediTrack account has been successfully deleted.",
          `<div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color:#dc3545;">MediTrack Account Deleted ❌</h2>
            <p>Hi ${user.name},</p>
            <p>Your account has been permanently deleted. You can always sign up again if you wish.</p>
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

export const requestVerification = async (req, res) => {
  try {
    const user = req.user.id;

    const existingRequest = await VerificationRequest.findOne({
      requestedUser: user,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending verification request.",
      });
    }

    const adminIds = await Admin.find({}, "_id");
    if (!adminIds.length) {
      return res.status(400).json({
        success: false,
        message: "No admins available to assign.",
      });
    }
    const randomIndex = Math.floor(Math.random() * adminIds.length);
    const randomAdminId = adminIds[randomIndex]._id;

    const documents = {};
    const fileKeys = [
      "aadhaarCard",
      "passport",
      "drivingLicence",
      "PANCard",
      "degreeCertificate",
      "schoolLevelCertificates",
    ];

    if (req.files) {
      const uploadPromises = fileKeys.map(async (key) => {
        if (req.files[key]) {
          const upload = await uploadOnCloudinary(req.files[key][0].path);
          if (upload) documents[key] = upload;
        }
      });

      await Promise.all(uploadPromises);
    }


    const newRequest = new VerificationRequest({
      requestedUser: user,
      admin: randomAdminId,
      ...documents,
    });

    await newRequest.save();

    return res.status(201).json({
      success: true,
      message: "Verification request submitted successfully.",
      assignedAdmin: randomAdminId,
      request: newRequest,
    });

  } catch (error) {
    console.error("Error in requestVerification:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting request.",
    });
  }
};

export const search = async (req, res) => {
  try {
    const { name, specialization } = req.query;

    const filter = {};
    if (name || specialization) {
      filter.$text = {
        $search: `${name || ""} ${specialization || ""}`.trim(),
      };
    }

    filter.isDelete = false;

    const doctors = await Doctor.find(filter).select("-password");

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}