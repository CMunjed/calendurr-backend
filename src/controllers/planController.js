const supabase = require('../config/supabaseClient');

// GET /plans
const getPlans = async (req, res) => {
    try {
        const { user } = req;
        
        const { data: plans, error } = await supabase
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
        

        /* Returns nested json structure like this
        {"plans": 
            [
                {
                    "id": "...",
                    "name": "...",
                    "created_at": "...",
                    "updated_at": "...",
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
        }
        */

        if (error) throw error;

        res.json({ plans });
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

        const { data: plan, error } = await supabase
            .from('plans')
            .select(`
                id, 
                name, 
                created_at, 
                updated_at,
                semesters (
                    id, term,
                    semester_courses (
                        course_id
                    )
                )
            `)
            .eq('id', id)   // Where plan.id = id in params
            .eq('user_id', user.id)
            .single();

        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        if (error) throw error;

        res.json({ plan });
    } catch (error) {
        console.error('Error fetching plan: ', error.message);
        res.status(500).json({ error: 'Failed to retrieve plan' });
    }
};


// POST /plans   -   Note: This route is simple and just creates an empty shell for a plan.
const createPlan = async (req, res) => {
    try {
        const { user } = req;
        const { name } = req.body;

        const { data: plan, error } = await supabase
            .from('plans')
            .insert([{ user_id: user.id, name }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ plan });
    } catch (error) {
        console.error('Error creating plan: ', error.message);
        res.status(500).json({ error: 'Failed to create plan' });
    }
}


// PUT /plans/:id   -   Note: This route only updates the plan metadata - name and updated_at. 
//                            For modifying semesters contained inside plans, use the semester routes.
const updatePlan = async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const { name } = req.body;

        const { data: plan, error } = await supabase
            .from('plans')
            .update({ name, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        if (error) throw error;

        res.json({ plan });
    } catch (error) {
        console.error('Error updating plan: ', error.message);
        res.status(500).json({ error: 'Failed to update plan' });
    }
}


// DELETE /plans/:id
const deletePlan = async (req, res) => {
    // Should delete the plan, including not just its entry, but also all semester and semester_course entries
    // This is bc of ON DELETE CASCADE
    try {
        const { user } = req;
        const { id } = req.params;

        const { error } = await supabase
            .from('plans')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Makes sure the user is authorized to delete the plan

        if (error) throw error;

        res.status(204).send(); // No content, sent on successful delete
    } catch (error) {
        console.error('Error deleting plan: ', error.message);
        res.status(500).json({ error: 'Failed to delete plan' });
    }
}


module.exports = {
    getPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan
}