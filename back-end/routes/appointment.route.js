import express from "express"
import { bookAppointment, cancelAppointment, stripeWebhook } from "../controllers/appointment.controller.js"
import isAuth from "../middleware/isAuth.middleware.js"
import authorizeRole from "../middleware/authorizeRole.middleware.js"
import bodyParser from 'body-parser';
const appointmentRouter = express.Router()

appointmentRouter.post("/book-appointment/:id", isAuth, authorizeRole("Patient"), bookAppointment
);

appointmentRouter.post("/cancel-appointment/:id", isAuth, authorizeRole("Patient"), cancelAppointment
);

appointmentRouter.post("/stripe/webhook", bodyParser.raw({ type: "application/json" }), stripeWebhook
);


export default appointmentRouter