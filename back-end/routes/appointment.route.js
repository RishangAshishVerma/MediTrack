import express from "express"
import { bookAppointment, cancelAppointment } from "../controllers/appointment.controller.js"
import isAuth from "../middleware/isAuth.middleware.js"
import authorizeRole from "../middleware/authorizeRole.middleware.js"

const appointmentRouter = express.Router()

appointmentRouter.post("/book-appointment/:id", isAuth, authorizeRole("Patient"), bookAppointment);
appointmentRouter.post("/cancel-appointment/:id", isAuth, authorizeRole("Patient"), cancelAppointment);




export default appointmentRouter