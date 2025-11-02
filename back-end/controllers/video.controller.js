import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;
import Appointment from "../models/appointment.model.js";
import sendMail from "../utils/nodemailer.js";

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;


export const startCall = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({
                success: false,
                message: "appointmentId is required",
            });
        }

        const appointment = await Appointment.findById(appointmentId)
            .populate("doctor")
            .populate("patient");

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        const channelName = `room_${appointment._id}`;
        const uid = 0;
        const role = RtcRole.PUBLISHER;

        const startTime = new Date(appointment.startTime);
        const endTime = new Date(appointment.endTime);
        const duration = Math.floor((endTime - startTime) / 1000);

        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpireTime = currentTimestamp + duration;

        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            uid,
            role,
            privilegeExpireTime
        );

        const meetingLink = `https://frontendapp.com/video/${channelName}?token=${token}`;

        appointment.meetingLink = meetingLink;
        await appointment.save();
        // --- Patient Email ---
        const patientSubject = "Your MediTrack Video Appointment is Ready";
        const patientHTML = `
      <h2>Your Video Appointment is Ready</h2>
      <p>Dear ${appointment.patient.name},</p>
      <p>Your video appointment with <b>Dr. ${appointment.doctor.name}</b> is starting soon.</p>
      <p><b>Meeting Link:</b> <a href="${meetingLink}">${meetingLink}</a></p>
      <p><b>Room ID:</b> ${channelName}</p>
      <p>Please join on time.</p>
      <br/>
      <p>– MediTrack Team</p>
    `;


        const doctorSubject = "MediTrack Video Call Scheduled with a Patient";
        const doctorHTML = `
      <h2>Your Video Appointment is Ready</h2>
      <p>Dear Dr. ${appointment.doctor.name},</p>
      <p>You have a scheduled video call with <b>${appointment.patient.name}</b>.</p>
      <p><b>Meeting Link:</b> <a href="${meetingLink}">${meetingLink}</a></p>
      <p><b>Room ID:</b> ${channelName}</p>
      <p>Please start the session on time.</p>
      <br/>
      <p>– MediTrack Team</p>
    `;

    
        await sendMail(
            appointment.patient.email,
            patientSubject,
            "Your MediTrack video call is ready",
            patientHTML
        );

        // send to doctor
        await sendMail(
            appointment.doctor.email,
            doctorSubject,
            "MediTrack video call scheduled with patient",
            doctorHTML
        );

        res.json({
            success: true,
            message: "Call started successfully",
            data: {
                appointmentId: appointment._id,
                doctor: appointment.doctor.name,
                patient: appointment.patient.name,
                meetingLink,
                token,
                channelName,
                appId: APP_ID,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error while starting call",
        });
    }
};



export const endCall = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId is required",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = "completed";
    await appointment.save();

    res.json({
      success: true,
      message: "Call ended and appointment marked as completed",
      data: { appointmentId: appointment._id, status: appointment.status },
    });
  } catch (error) {
    console.error("Error ending call:", error);
    res.status(500).json({
      success: false,
      message: "Server error while ending call",
    });
  }
};
