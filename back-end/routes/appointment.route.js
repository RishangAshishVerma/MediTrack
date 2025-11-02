import express from "express"
import { bookAppointment, cancelAppointment } from "../controllers/appointment.controller.js"
import isAuth from "../middleware/isAuth.middleware.js"

const appointmentRouter = express.Router()

appointmentRouter.post("/book-appointment/:id", isAuth, bookAppointment);
appointmentRouter.post("/cancel-appointment/:id", isAuth, cancelAppointment);




export default appointmentRouter