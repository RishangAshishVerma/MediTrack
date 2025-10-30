import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import connectDb from "./config/connectDb.js";
import patientRouter from "./routes/patient.route.js";
import cookieParser from "cookie-parser";
import doctorRouter from "./routes/doctor.routes.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();
const PORT = process.env.PORT || 5000
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean) || '*',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", patientRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  connectDb()
  console.log(`Server is started on port no ${PORT}`);
});



