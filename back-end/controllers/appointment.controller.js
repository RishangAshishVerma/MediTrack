import Appointment from "../models/appointment.model.js"
import Doctor from "../models/doctor.model.js"

export const bookAppointment = async (req, res) => {
    try {
        const user = req.user.id;
        const doctorid = req.params.id;

        const doctorfind = await Doctor.findById(doctorid);

        const { startTime, endTime, problem } = req.body;

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!doctorfind) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        if (!startTime || !endTime || !problem) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing.",
            });
        }


        const diffInMs = new Date(endTime) - new Date(startTime);
        const diffInMinutes = diffInMs / (1000 * 60);

        if (diffInMinutes > doctorfind.slotDurationMinutes) {
            return res.status(400).json({
                success: false,
                message: `The difference between start and end time cannot be more than ${doctorfind.slotDurationMinutes} minutes.`,
            });
        }
        const existingAppointment = await Appointment.findOne({
            doctor: doctorid,
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "This time slot is already booked for the doctor.",
            });
        }
        const booking = await Appointment.create({
            startTime,
            endTime,
            problem,
            patient: user,
            doctor: doctorid,
        });

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: booking,
        });
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


export const cancelAppointment = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId =  req.user.id;
        const { cancelReason } = req.body;


        if (!cancelReason) {
            return res.status(400).json({
                success: false,
                message: "Cancellation reason is required.",
            });
        }


        const appointment = await Appointment.findById(bookingId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found.",
            });
        }


        if (appointment.patient.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only cancel your own appointments.",
            });
        }


        const now = new Date();
        const startTime = new Date(appointment.startTime);
        const diffInMs = startTime - now;
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours < 4) {
            return res.status(400).json({
                success: false,
                message: "You can only cancel appointments at least 4 hours before the start time.",
            });
        }


        appointment.cancel = true;
        appointment.cancelReason = cancelReason;
        appointment.canceledAt = new Date();

        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment canceled successfully.",
            data: appointment,
        });

    } catch (error) {
        console.error("Error canceling appointment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

