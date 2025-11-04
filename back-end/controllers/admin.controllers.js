import Admin from "../models/admin.model.js";
import genToken from "../utils/token.js";
import sendMail from "../utils/nodemailer.js";
import bcrypt from "bcrypt";
import uploadOnCloudinary from "../utils/cloudinary.js";
import VerificationRequest from "../models/verification.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/Patient.model.js"
export const AdminSignup = async (req, res) => {
    const { name, email, mobileNumber, password, dob, age, gender } = req.body;

    try {
        if (!name || !email || !mobileNumber || !password || !dob || !age || !gender) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory.",
            });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Admin already exists. Please login or use a different email.",
            });
        }

        if (existingAdmin?.isDelete) {
            return res.status(409).json({
                success: false,
                message: "This admin account is deleted. Please contact support.",
            });
        }

        const hashPassword = await bcrypt.hash(password, 8);

        const admin = await Admin.create({
            name,
            email,
            mobileNumber,
            password: hashPassword,
            dob,
            age,
            gender,
            profileImage: " ",
        });

        const token = await genToken(admin._id, admin.role);

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
                message: "Admin created successfully.",
                data: admin,
            });

        (async () => {
            try {
                if (req.file?.path) {
                    const imageUrl = await uploadOnCloudinary(req.file.path);
                    if (imageUrl) {
                        await Admin.findByIdAndUpdate(admin._id, { profileImage: imageUrl });
                    }
                }

                await sendMail(
                    admin.email,
                    "Welcome to MediTrack!",
                    "Welcome to MediTrack — we're glad to have you on board.",
                    `<div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>Welcome to <span style="color:#007bff;">MediTrack</span> 🎉</h2>
                        <p>Hi ${admin.name},</p>
                        <p>Thank you for joining <b>MediTrack</b>. We’re excited to help you manage your health smarter and easier.</p>
                        <p>Best regards,<br><b>The MediTrack Team</b></p>
                    </div>`
                );
            } catch (error) {
                console.error("Background task failed:", error);
            }
        })();

    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again later.",
        });
    }
};

export const AdminSignIn = async (req, res) => {
    try {
        const { name, email, password, } = req.body
        console.log(req.body);

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing.",
            });
        }
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin?.isDeleted) {
            return res.status(409).json({
                success: false,
                message:
                    "User account has been deleted. Please contact support for assistance.",
            });
        }

        let isMatch = bcrypt.compare(password, existingAdmin.password)

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        let token = genToken(existingAdmin._id, existingAdmin.role)

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).json({
            success: true,
            message: "User login successfully.",
            data: existingAdmin,
        });
    } catch (error) {
        console.error("Error while logging in the user:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while logging in. Please try again later.",
        });
    }
};

export const AdminSignOut = async (req, res) => {
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

        const user = await Admin.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (!user.isDeleted) {
            user.isDeleted = true;
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

// export const getRandomAdminindex = async (req, res) => {
//     try {

//         const adminIds = await Admin.find({}, "_id");

//         const randomIndex = Math.floor(Math.random() * adminIds.length);

//         const randomAdminId = adminIds[randomIndex]

//         return res.status(200).json(randomAdminId)

//     } catch (error) {

//         console.error("Error fetching admins:", error);
//         return res.status(500).json({ message: "Error fetching admins" });
//     }
// };

export const updateVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { Status } = req.body;
        const adminId = req.user.id;

        const request = await VerificationRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (!request.admin || request.admin.toString() !== adminId?.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are not allowed to access this request",
            });
        }


        if (request.status === "accepted" || request.status === "rejected") {
            return res.status(400).json({ success: false, message: "Request already processed." });
        }

        if (Status !== "accepted" && Status !== "rejected") {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }

        request.status = Status;
        request.admin = adminId;
        await request.save();

        if (Status === "accepted") {
            await Doctor.findByIdAndUpdate(request.requestedUser, { isVerified: true });
        } else {
            await Doctor.findByIdAndUpdate(request.requestedUser, { isVerified: false });
        }

        const updatedRequest = await VerificationRequest.findById(id)
            .populate("requestedUser", "name email")
            .populate("admin", "name");

        return res.status(200).json({
            success: true,
            message: `Request ${Status}`,
            request: updatedRequest
        });

    } catch (error) {
        console.error("Verification update error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const getPatient = async (req, res) => {
    try {

        const { email } = req.body
        const existingPatient = await Patient.findOne({ email })

        if (!existingPatient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.status(200).json({
            success: true,
            existingPatient
        })

    } catch (error) {
        console.log(`error while getting Patient data ${error}`);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export const getDoctor = async (req, res) => {
    try {

        const { email } = req.body
        const existingDoctor = await Doctor.findOne({ email })

        if (!existingDoctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.status(200).json({
            success: true,
            existingDoctor
        })

    } catch (error) {
        console.log(`error while getting Doctor data${error}`);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}
