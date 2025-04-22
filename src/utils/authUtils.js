const supabase = require('../config/supabaseClient');
const { HttpError } = require('./errors');

const ACCESS_TOKEN = 'sb-access-token';
const REFRESH_TOKEN = 'sb-refresh-token';

const ACCESS_TOKEN_LIFESPAN = 60 * 60 * 1000 // 1 hour for access token
const REFRESH_TOKEN_LIFESPAN = 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token


const generateCookies = (res, access_token, refresh_token) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    res.cookie(ACCESS_TOKEN, access_token, {
        ...cookieOptions,
        maxAge: ACCESS_TOKEN_LIFESPAN
    });

    res.cookie(REFRESH_TOKEN, refresh_token, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_LIFESPAN
    });
};


const refreshSession = async (req, res) => {
    const refresh_token = req.cookies[REFRESH_TOKEN];

    if (!refresh_token) throw new HttpError(401, 'No refresh token');

    // Refresh session w/ supabase
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error || !data.session) throw new HttpError(401, 'Session refresh failed');

    // Extract new tokens
    const { access_token, refresh_token: newRefreshToken, user } = data.session;

    // Generate new cookies
    generateCookies(res, access_token, newRefreshToken);

    // REMOVE IN PROD
    //if (process.env.NODE_ENV !== 'production') 
    console.log("Session refreshed for user: " + user.email);

    return data.session;
};

module.exports = { ACCESS_TOKEN, generateCookies, refreshSession };
