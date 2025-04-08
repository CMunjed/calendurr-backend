const supabase = require('../config/supabaseClient');

const getUserPlans = async (req, res) => {
    try {
        const { user } = req;

        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('user_id', user.id);

        if (error) throw error;

        res.json({ plans: data });
    } catch (error) {
        console.error('Error fetching plans:', error.message);
        res.status(500).json({ error: 'Failed to retrieve plans' });
    }
};

module.exports = {
    getUserPlans,
}