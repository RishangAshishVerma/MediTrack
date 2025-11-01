import express from "express"
import { bookAppointment } from "../controllers/appointment.controller.js"
import isAuth from "../middleware/isAuth.middleware.js"

const appointmentRouter = express.Router()

appointmentRouter.post("/book-appointment/:id", isAuth, bookAppointment);




export default appointmentRouter