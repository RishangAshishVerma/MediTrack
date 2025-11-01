import Appointment from "../models/appointment.model.js"
import Doctor from "../models/doctor.model.js"

export const bookAppointment = async (req, res) => {
    try {
        const user = req.userId;
        const doctorid = req.params.id;

        const doctorfind = await Doctor.findById(doctorid);

        const { startTime, endTime, problem } = req.body;

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!doctorfind) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        if (!startTime || !endTime  || !problem) {
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
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
