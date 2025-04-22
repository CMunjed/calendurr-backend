const supabase = require("../config/supabaseClient");
const { ACCESS_TOKEN, refreshSession } = require('../utils/authUtils');
const { HttpError } = require('../utils/errors');

/*const authMiddleware = async (req, res, next) => {
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
};*/


// New authMiddleware
const authMiddleware = async (req, res, next) => {
    try {
        let user;

        // Validate access token
        const access_token = req.cookies[ACCESS_TOKEN];
        
        if (access_token) {
            // Get user from supabase
            const { data: { user: fetchedUser }, error } = await supabase.auth.getUser(access_token);

            if (fetchedUser && !error) {
                req.user = fetchedUser;
                return next();
            }
        }

        // If access token is missing/invalid, refresh
        const session = await refreshSession(req, res);

        if (!session?.user) {
            return res.status(401).json({ error: 'Unable to refresh session' });
        }

        req.user = session.user;
        next();

        /*if (!access_token) return res.status(401).json({ error: 'Unauthorized' });

        // Get user from supabase
        const { data: { fetchedUser }, error } = await supabase.auth.getUser(access_token);

        if (error || !fetchedUser) {
            //return res.status(401).json({ error: 'Invalid token' });
            user = await refreshSession(req, res);
        } else {
            user = fetchedUser;
        }

        // Attach user object to the request for use in next middleware/route
        req.user = user;

        // Pass control to next middleware or route handler
        next();*/
    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.status).json({ error: error.message });
        }

        console.error('Unexpected authentication error:', error);
        return res.status(500).json({ error: 'Unexpected authentication error' });
    }
};

module.exports = authMiddleware;
