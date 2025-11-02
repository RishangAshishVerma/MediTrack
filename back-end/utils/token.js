import jwt from "jsonwebtoken";

const genToken = (userId,role) => {
    try {
        const token = jwt.sign(
            { userId,role},
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return token;
    } catch (error) {
        console.error("Error generating token:", error);
       
    }
};

export default genToken;
