import express from "express"
import upload from "../config/multer.js"
import isAuth from "../middleware/isAuth.middleware.js"
import { deleteAccount, signIn, signOut, signUp } from "../controllers/patient.controller.js"


const patientRouter = express.Router()

patientRouter.post("/signup", upload.single('profileImage'), signUp)
patientRouter.post("/signin", signIn)
patientRouter.post("/signout", signOut)
patientRouter.delete("/deleteaccount", isAuth, deleteAccount)


export default patientRouter