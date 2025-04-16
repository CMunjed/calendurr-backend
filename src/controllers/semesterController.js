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

        if (semesterError) throw semesterError;

        return res.json({ semesters });
    } catch (error) {
        console.error('Error fetching semesters:', error.message);
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
        console.error('Error fetching semester:', error.message);
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

    /* Expected req.body shape
        {
            "term": "Fall",
            "semester_courses": [
                { "course_id": 1 },
                { "course_id": 2 }
            ]
        }
    */

    try {
        const { user } = req;
        const { id } = req.params; // Assuming semesterId comes from params
        const { term, semester_courses } = req.body; // Assuming newSemesterData contains updates

        // Get the semester --> ensure it exists --> get plan_id
        const { data: semester, error: semesterError } = await supabase
            .from('semesters')
            .select('id, plan_id')
            .eq('id', id)
            .single();

        if (semesterError || !semester) {
            return res.status(404).json({ error: 'Semester not found' });
        }

        // Make sure the user owns the plan
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('id')
            .eq('id', semester.plan_id)
            .eq('user_id', user.id)
            .single();

        if (planError || !plan) {
            return res.status(403).json({ error: 'Unauthorized access to semester' });
        }

        // Update semester data (just term atp)
        const { error: updateSemesterError } = await supabase
            .from('semesters')
            .update({ term })
            .eq('id', id);

        if (updateSemesterError) {
            return res.status(500).json({ error: 'Failed to update semester' });
        }

        // Replace semester_courses belonging to the semester
        if (Array.isArray(semester_courses)) { // Only if semester_courses is in the request body
            // Delete existing semester_courses
            const { error: deleteCoursesError } = await supabase
                .from('semester_courses')
                .delete()
                .eq('semester_id', id);

            if (deleteCoursesError) {
                return res.status(500).json({ error: 'Failed to delete old semester_courses' });
            }

            // Insert new semester_courses
            const newCourses = semester_courses.map(sc => ({
                semester_id: id,
                course_id: sc.course_id,
            }));

            if (newCourses.length > 0) {
                const { error: insertError } = await supabase
                    .from('semester_courses')
                    .insert(newCourses);

                if (insertError) {
                    return res.status(500).json({ error: 'Failed to insert new semester_courses' });
                }
            }
        }

        // Update plan’s updated_at timestamp
        const { error: planUpdateError } = await supabase
            .from('plans')
            .update({ updated_at: new Date() })
            .eq('id', semester.plan_id);

        if (planUpdateError) {
            return res.status(500).json({ error: 'Failed to update plan timestamp' });
        }

        // A verbose response body containing the new semester data shouldn't be necessary,
        // since the UI updates locally. The new semester data will by synced upon page refresh.
        res.status(200).json({ message: 'Semester and courses updated successfully' });
    } catch (error) {
        console.error('Error updating semester:', error.message);
        res.status(500).json({ error: 'Unexpected error updating semester' });
    }
}  


// DELETE /semesters/:id
const deleteSemester = async (req, res) => {     
    try {
        const { user } = req;
        const { id } = req.params;

        // Get semester (make sure it exists)
        const { data: semester, error: semesterError } = await supabase
            .from('semesters')
            /*.select(`
                id,
                term,
                plan_id,
                semester_courses (
                    course_id
                )
            `)*/
            .select(`
                id,
                plan_id,
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
        // Don't have to delete associated semester_courses because of ON DELETE CASCADE
        const { error: deleteError } = await supabase
            .from('semesters')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        res.status(204).send(); // No content, sent on successful delete
    } catch (error) {
        console.error('Error deleting semester:', deleteError.message);
        res.status(500).json({ error: 'Failed to delete semester' });
    }        
}

module.exports = {
    getSemestersInPlan,
    getSemesterById,
    createSemester,
    updateSemester,
    deleteSemester
}