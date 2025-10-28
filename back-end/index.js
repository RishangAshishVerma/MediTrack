import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import connectDb from "./config/connectDb.js";


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
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req, res) => {
  res.cookie('time', new Date().toISOString());
  res.send('ok');
});

app.listen(PORT, () => {
  connectDb()
  console.log(`Server is started on port no ${PORT}`);
});



