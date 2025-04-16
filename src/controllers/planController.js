const supabase = require('../config/supabaseClient');


// GET /plans
const getPlans = async (req, res) => {
    try {
        const { user } = req;

        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('user_id', user.id);

        /*
        const { data, error } = await supabase
            .from('plans')
            .select(`
                id,
                name,
                created_at,
                updated_at,
                semesters (
                    id,
                    term,
                    semester_courses (
                        course_id
                    )
                )
            `)
            .eq('user_id', user.id); 
        */

        /* Will return nested json structure like this
        [
            {
                "id": "...",
                "name": "...",
                "semesters": [
                {
                    "id": "...",
                    "term": "...",
                    "semester_courses": [
                    { "course_id": "..." },
                    { "course_id": "..." }
                    ]
                }
                ]
            }
        ]
        */

        if (error) throw error;

        res.json({ plans: data });
    } catch (error) {
        console.error('Error fetching plans: ', error.message);
        res.status(500).json({ error: 'Failed to retrieve plans' });
    }
};


// GET /plans/:id
const getPlanById = async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const { data, error } = await supabase
            .from('plans')
            .select(`
                id, name, created_at, updated_at,
                semesters (
                    id, term,
                    semester_courses (
                        course_id
                    )
                )
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single();
        if (!data) return res.status(404).json({ error: 'Plan not found' });
        if (error) throw error;
        res.json({ plan: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve plan' });
    }
};


// POST /plans
const createPlan = async (req, res) => {
    try {
        const { user } = req;
        const { name } = req.body;
        const { data, error } = await supabase
            .from('plans')
            .insert([{ user_id: user.id, name }])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json({ plan: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create plan' });
    }
}


// PUT /plans/:id
const updatePlan = async (req, res) => {
    /*try {
        const { user } = req;
        const { id } = req.params;
        const { name } = req.body;
        const { data, error } = await supabase
            .from('plans')
            .update({ name, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();
        if (!data) return res.status(404).json({ error: 'Plan not found' });
        if (error) throw error;
        res.json({ plan: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update plan' });
    }*/
}


// DELETE /plans/:id
const deletePlan = async (req, res) => {
    // Hold off on implementing this route until the other ones are tested more thoroughly.
    /*
    try {
        const { user } = req;
        const { id } = req.params;
        const { error } = await supabase
            .from('plans')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) throw error;
        res.status(204).send(); // No content, sent on successful delete
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete plan' });
    }
    */
}


module.exports = {
    getPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan
}