import express from "express"
import upload from "../config/multer.js"
import isAuth from "../middleware/isAuth.middleware.js"
import { signUp } from "../controllers/doctor.controller.js"



const doctorRouter = express.Router()

doctorRouter.post("/signup", upload.single('profileImage'), signUp)
// patientRouter.post("/signin", signIn)
// patientRouter.post("/signout", signOut)
// patientRouter.delete("/deleteaccount", isAuth, deleteAccount)


export default doctorRouter