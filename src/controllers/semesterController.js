const supabase = require('../config/supabaseClient');

// GET /plans/:id/semesters
const getSemestersInPlan = async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;

        // First, make sure the plan belongs to the user
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (planError || !plan) {
            return res.status(404).json({ error: 'Plan not found or unauthorized' });
        }

        // Next, get the semesters in the plan
        const { data: semesters, error: semesterError } = await supabase
            .from('semesters')
            .select(`
                id,
                term,
                semester_courses (
                    course_id
                )
            `)
            .eq('plan_id', id)

        if (semesterError) {
            console.error('Error fetching semesters:', semesterError.message);
            return res.status(500).json({ semesterError: 'Failed to retrieve semesters' });
        }

        return res.json({ semesters });
    } catch (error) {
        console.error('Unexpected error fetching semesters:', error.message);
        return res.status(500).json({ error: 'Failed to retrieve semesters' });
    }   
}


// GET /semesters/:id
const getSemesterById = async (req, res) => {  
    try {
        const { user } = req;
        const { id } = req.params;

        // Get semester
        const { data: semester, error: semesterError } = await supabase
            .from('semesters')
            .select(`
                id,
                term,
                plan_id,
                semester_courses (
                    course_id
                )
            `)
            .eq('id', id)
            .single();

        if (semesterError || !semester) {
            return res.status(404).json({ error: 'Semester not found' });
        }

        // Make sure the semester actually belongs to one of the user's plans
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('id, user_id')
            .eq('id', semester.plan_id)
            .eq('user_id', user.id)
            .single();

        if (planError || !plan) {
            //console.log(planError);
            return res.status(403).json({ error: 'Unauthorized access to semester' });
        }

        return res.json({ semester });
    } catch (error) {
        console.error('Unexpected error fetching semester:', error.message);
        return res.status(500).json({ error: 'Failed to retrieve semester' });
    }   
}    


// POST /semesters
const createSemester = async (req, res) => {
}    


// PUT /semesters/:id
const updateSemester = async (req, res) => {    
}  


// DELETE /semesters/:id
const deleteSemester = async (req, res) => {             
}

module.exports = {
    getSemestersInPlan,
    getSemesterById,
    createSemester,
    updateSemester,
    deleteSemester
}