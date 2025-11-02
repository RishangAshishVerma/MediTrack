import express from "express"
import upload from "../config/multer.js"
import isAuth from "../middleware/isAuth.middleware.js"
import { AdminSignIn, AdminSignOut, AdminSignup, deleteAccount, updateVerificationStatus } from "../controllers/admin.controllers.js"
import authorizeRole from "../middleware/authorizeRole.middleware.js"


const adminRouter = express.Router()

adminRouter.post("/signup", upload.single('profileImage'), AdminSignup)
adminRouter.post("/signin", AdminSignIn)
adminRouter.post("/signout", AdminSignOut)
adminRouter.delete("/deleteaccount", isAuth, deleteAccount)
adminRouter.post("/VerificationStatus/:id", isAuth,authorizeRole("Admin") ,updateVerificationStatus)

export default adminRouter