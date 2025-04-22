const supabase = require('../config/supabaseClient');
const { refreshSession, generateCookies } = require('../utils/authUtils');
const { HttpError } = require('../utils/errors');


// Register a new user
const register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // First, sign up the user
        const { user, error } = await supabase.auth.signUp({ 
            email, 
            password
        });

        if (error) throw error;

        res.json({ message: 'User registered', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Log a user in
/*const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
        });
        
        if (error) throw error;
        
        // Get session from supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        // Set session cookie in the response
        res.cookie('sb-access-token', session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        res.json({ 
            message: 'User logged in', 
            user: data.user,
            session: session      // Returning the session data in the json response poses security risks; only use for testing w/ curl
        });
    } catch (error) {
        console.error('Login error: ', error);
        res.status(401).json({ error: error.message });
    }
};*/


// New login route
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error || !data.session) return res.status(401).json({ error: error?.message || 'Invalid credentials' });

        /*
        // Store access token in HTTP-only cookie
        res.cookie('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        // Store refresh token in cookie as well
        res.cookie('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });*/

        generateCookies(res, data.session.access_token, data.session.refresh_token);

        // Return user and session data, for testing. Probably a good idea to remove in production.
        if (process.env.NODE_ENV === 'production') {
            res.json({ message: 'Logged in', user: data.user});
        } else {
            res.json({ message: 'Logged in', user: data.user, session: data.session });
        }
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}


// Get current user
const me = async (req, res) => {
    // Return user info
    res.json({ user: req.user });
};


// Refresh route without helper function
/*const refresh = async (req, res) => {
    try {
        const refresh_token = req.cookies['sb-refresh-token'];

        if (!refresh_token) return res.status(401).json({ error: 'No refresh token' });

        const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    
        if (error || !data.session) return res.status(401).json({ error: 'Refresh failed' });

        const { access_token, refresh_token: newRefresh } = data.session;

        res.cookie('sb-access-token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.cookie('sb-refresh-token', newRefresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    
        res.json({ message: 'Session refreshed' });


    } catch (error) {
        console.error('Error refreshing session:', error);
        res.status(500).json({ error: 'Unexpected error while refreshing session' });
    }
}*/

// New refresh route
const refresh = async (req, res) => {
    try {
        // Use helper function to refresh session and generate cookies
        await refreshSession(req, res);

        res.json({ message: 'Session refreshed' });
    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.status).json({ error: error.message });
        }

        console.error('Error refreshing session:', error);
        res.status(500).json({ error: 'Unexpected error while refreshing session' });
    }
};


module.exports = {
    register,
    login,
    me,
    refresh
};