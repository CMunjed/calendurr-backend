/*const supabase = require("../config/supabaseClient");

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Have Supabase validate the JWT
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = data.user; // Attach the user object to the request
    next();
};

module.exports = authMiddleware;
*/
