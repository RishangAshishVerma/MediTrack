import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendMail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"MediTrack Team" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("Message sent:", info.messageId);
        return info;
    } catch (err) {
        console.error("Error while sending mail:", err);
        throw err;
    }
};

export default sendMail;
