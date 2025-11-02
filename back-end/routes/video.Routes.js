import express from "express";
import { endCall, startCall } from "../controllers/video.Controller.js";

const videorouter = express.Router();

videorouter.post("/start-call", startCall);
videorouter.post("/end-call", endCall);
    
export default videorouter;
