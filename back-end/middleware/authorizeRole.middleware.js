
const authorizeRole = async (allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.userId

            if (!user || !user.role) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied: user role not found.",
                });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied: insufficient permissions.",
                });
            }
            next()
        } catch (error) {
            console.error("Error while verifying user role:", error);
            return res.status(500).json({
                success: false,
                message: "An unexpected error occurred while verifying your account role.",
            });
        }
    }

}

export default authorizeRole;
