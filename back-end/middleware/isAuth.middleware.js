import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {

    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    console.log("🔑 Token received:", token);

    if (!token || typeof token !== "string") {
      return res.status(401).json({
        message: "User does not have a valid token.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("❌ isAuth error:", error.message);
    return res.status(401).json({
      message: "User does not have a valid token.",
    });
  }
};

export default isAuth;
