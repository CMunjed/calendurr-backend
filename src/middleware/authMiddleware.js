const supabase = require("../config/supabaseClient");

const authMiddleware = async (req, res, next) => {
    try {
        // Get user from supabase
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Error fetching user:', error);
            return res.status(401).json({ error: 'Unauthorized: ' + error.message });
        }

        // No user found, return unauthorized response
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: No user found' });
        }

        // Attach user object to the request for use in next middleware/route
        req.user = user;

        // Pass control to next middleware or route handler
        next();
    } catch (error) {
        console.error('Unexpected error in authMiddleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = authMiddleware;
