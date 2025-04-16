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
    try {
        const { user } = req;
        const { plan_id, term, semester_courses } = req.body;

        if (!plan_id) {
            return res.status(400).json({ error: 'plan_id is required' });
        }

        // Make sure the plan belongs to the user
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('id')
            .eq('id', plan_id)
            .eq('user_id', user.id)
            .single();

        if (planError || !plan) {
            return res.status(403).json({ error: 'Unauthorized access to plan' });
        }

        // Insert the semester
        const { data: newSemester, error: insertError } = await supabase
            .from('semesters')
            .insert([{ plan_id, term }])
            .select()
            .single();

        if (insertError) {
            console.error('Error creating semester:', insertError.message);
            return res.status(500).json({ error: 'Failed to create semester' });
        }

        // Add semester_courses, if any
        //let insertedCourses = [];
        if (semester_courses?.length > 0) {
            // semester_courses are put in the request body in the format \"semester_courses\":[\"course-id\"]
            // We need something like \"semester_courses\":[{\"semester_id\": \"\", \"course-id\": \"\"}]
            const courseInserts = semester_courses.map(course_id => ({
                semester_id: newSemester.id,
                course_id
            }));

            const { error: courseInsertError } = await supabase
                .from('semester_courses')
                .insert(courseInserts, { returning: 'representation' }); // Returns inserted rows

            if (courseInsertError) {
                console.error('Error inserting semester_courses:', courseInsertError.message);
                return res.status(500).json({ error: 'Semester created but failed to add courses' });
            }

            //insertedCourses = data;
        }

        // Fetch the inserted semester_course entries, so they can be returned in the response
        const { data: insertedCourses, error: fetchCoursesError } = await supabase
            .from('semester_courses')
            .select('course_id')
            .eq('semester_id', newSemester.id);

        if (fetchCoursesError) {
            console.error('Error fetching semester_courses:', fetchCoursesError.message);
            return res.status(500).json({ error: 'Semester created but failed to fetch courses' });
        }

        // Response
        return res.status(201).json({
            semester: {
                ...newSemester,
                semester_courses: insertedCourses
            }
        });
    } catch (error) {
        console.error('Unexpected error creating semester:', error.message);
        res.status(500).json({ error: 'Failed to create semester' });
    }
}    


// PUT /semesters/:id
const updateSemester = async (req, res) => {    
}  


// DELETE /semesters/:id
const deleteSemester = async (req, res) => {     
    try {
        const { user } = req;
        const { id } = req.params;

        // Get semester (make sure it exists)
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

        // Finally, delete the semester
        const { error: deleteError } = await supabase
            .from('semesters')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting semester:', deleteError.message);
            return res.status(500).json({ error: 'Failed to delete semester' });
        }

        res.status(204).send(); // No content, sent on successful delete
    } catch (error) {
        res.status(500).json({ error: 'Unexpected error deleting semester' });
    }        
}

module.exports = {
    getSemestersInPlan,
    getSemesterById,
    createSemester,
    updateSemester,
    deleteSemester
}