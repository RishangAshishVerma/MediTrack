import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;

        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        return null;
    }
};

export default uploadOnCloudinary;
