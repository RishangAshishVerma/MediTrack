import express from "express"
import upload from "../config/multer.js"
import isAuth from "../middleware/isAuth.middleware.js"
import { deleteAccount, requestVerification, signIn, signOut, signUp } from "../controllers/doctor.controller.js"
import authorizeRole from "../middleware/authorizeRole.middleware.js"
// import authoriz


const doctorRouter = express.Router()

doctorRouter.post("/signup", upload.single('profileImage'), signUp)
doctorRouter.post("/signin", signIn)
doctorRouter.post("/signout", signOut)
doctorRouter.delete("/deleteaccount", isAuth, deleteAccount)

doctorRouter.post("/verification-request", isAuth, authorizeRole("Doctor") , upload.fields([
    { name: "aadhaarCard", maxCount: 1 },
    { name: "passport", maxCount: 1 },  
    { name: "drivingLicence", maxCount: 1 },
    { name: "PANCard", maxCount: 1 },
    { name: "degreeCertificate", maxCount: 1 },
    { name: "schoolLevelCertificates", maxCount: 1 },
]) ,requestVerification)




export default doctorRouter