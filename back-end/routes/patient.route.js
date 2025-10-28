import express from "express"
import upload from "../config/multer.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import { signup } from "../controllers/patient.controller.js"

const patientRouter = express.Router()

patientRouter.post("/signup", upload.single('profileImage'), signup)


export default patientRouter