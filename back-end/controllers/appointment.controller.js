import Appointment from "../models/appointment.model.js"
import Doctor from "../models/doctor.model.js"
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const bookAppointment = async (req, res) => {
    try {
        const user = req.user.id;
        const doctorId = req.params.id;
        const doctor = await Doctor.findById(doctorId);
        const { startTime, endTime, problem, amount } = req.body;

        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
        if (!startTime || !endTime || !problem)
            return res.status(400).json({ success: false, message: "Required fields are missing." });

        const diffInMs = new Date(endTime) - new Date(startTime);
        const diffInMinutes = diffInMs / (1000 * 60);
        if (diffInMinutes > doctor.slotDurationMinutes) {
            return res.status(400).json({
                success: false,
                message: `The difference between start and end time cannot exceed ${doctor.slotDurationMinutes} minutes.`,
            });
        }

        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "This time slot is already booked for the doctor.",
            });
        }

        //  Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // amount in cents, e.g., $10 = 1000
            currency: "usd",
            metadata: {
                patientId: user,
                doctorId,
                startTime,
                endTime,
                problem,
            },
        });

        // Return the clientSecret to the frontend
        return res.status(200).json({
            success: true,
            message: "Payment initiated. Please complete payment to confirm appointment.",
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error initiating appointment payment:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("❌ Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const meta = paymentIntent.metadata;

        console.log("✅ Payment succeeded for:", paymentIntent.id);

        try {

            const conflict = await Appointment.findOne({
                doctor: meta.doctorId,
                $or: [{ startTime: { $lt: meta.endTime }, endTime: { $gt: meta.startTime } }],
            });

            if (conflict) {
                console.log("❌ Slot already booked. Skipping appointment creation.");
                return res.status(200).json({ received: true });
            }


            await Appointment.create({
                patient: meta.patientId,
                doctor: meta.doctorId,
                startTime: meta.startTime,
                endTime: meta.endTime,
                problem: meta.problem,
                status: "scheduled",
                paymentStatus: "paid",
                paymentIntentId: paymentIntent.id,
            });

            console.log("✅ Appointment created after payment success");
        } catch (err) {
            console.error("Error creating appointment after payment success:", err);
        }
    }

    if (event.type === "payment_intent.payment_failed") {
        console.log("❌ Payment failed for:", event.data.object.id);
    }

    res.json({ received: true });
};

export const cancelAppointment = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;
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
        appointment.status = "cancelled";
        appointment.canceledAt = new Date();

       
        if (appointment.paymentStatus === "paid" && appointment.paymentIntentId) {
            try {
                const refund = await stripe.refunds.create({
                    payment_intent: appointment.paymentIntentId,
                    reason: "requested_by_customer",
                });

                appointment.paymentStatus = "refunded";

                console.log(" Stripe refund successful:", refund.id);
            } catch (refundError) {
                console.error(" Stripe refund failed:", refundError);
                return res.status(500).json({
                    success: false,
                    message: "Appointment canceled, but refund failed. Please contact support.",
                });
            }
        }

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

