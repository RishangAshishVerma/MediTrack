import jwt from "jsonwebtoken";

const genToken = async (userId) => {
    try {
        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        return res.Status(200).json({ Message: "error whilr generating the token " })
    }
};

export default genToken