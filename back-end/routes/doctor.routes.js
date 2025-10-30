import express from "express"
import upload from "../config/multer.js"
import isAuth from "../middleware/isAuth.middleware.js"
import {  deleteAccount, signIn, signOut, signUp } from "../controllers/doctor.controller.js"



const doctorRouter = express.Router()

doctorRouter.post("/signup", upload.single('profileImage'), signUp)
doctorRouter.post("/signin", signIn)
doctorRouter.post("/signout", signOut)
doctorRouter.delete("/deleteaccount", isAuth, deleteAccount)

export default doctorRouter