const supabase = require('../config/supabaseClient');

// GET /plans
const getPlans = async (req, res) => {
    try {
        const { user } = req;

        /*const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('user_id', user.id);*/
        
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

        if (!data) return res.status(404).json({ error: 'Plan not found' });
        if (error) throw error;

        res.json({ plan: data });
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

        const { data, error } = await supabase
            .from('plans')
            .insert([{ user_id: user.id, name }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ plan: data });
    } catch (error) {
        console.error('Error creating plan: ', error.message);
        res.status(500).json({ error: 'Failed to create plan' });
    }
}


// PUT /plans/:id
const updatePlan = async (req, res) => {

    return;

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

    /*try {
        const { user } = req;
        const { id } = req.params;
        const { semesters } = req.body;  // Semester data to be added

        // Make sure plan exists already
        const { data: planData, error: planError } = await supabase
            .from('plans')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (planError || !planData) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Update plan data
        const { name: currentName } = planData;
        if (req.body.name) {
            const { error: updateError } = await supabase
                .from('plans')
                .update({ 
                    name: req.body.name ?? currentName, // Use name already in the db if not provided in the request 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', id)
                .eq('user_id', user.id);
        
            if (updateError) {
                console.error('Update error:', updateError);
                return res.status(500).json({ error: 'Failed to update plan data' });
            }
        }

        // Insert semesters
        for (const semester of semesters) {
            const { term, courses } = semester;

            const { data: semesterData, error: semesterError } = await supabase
                .from('semesters')
                .insert([{ plan_id: id, term }])
                .select()
                .single();

            if (semesterError) {
                return res.status(500).json({ error: 'Failed to create semester' });
            }

            const semesterId = semesterData.id;

            // If successful, insert courses as well
            for (const courseId of courses) {
                const { error: courseError } = await supabase
                    .from('semester_courses')
                    .insert([{ semester_id: semesterId, course_id: courseId }]); // Status left null

                if (courseError) {
                    return res.status(500).json({ error: 'Failed to assign courses to semester' });
                }
            }
        }

        // Retrieve updated plan to send as a response
        const updatedPlan = await supabase
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
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        res.json({ plan: updatedPlan });
    } catch (error) {
        console.error('Error updating plan: ', error.message);
        res.status(500).json({ error: 'Failed to update plan' });
    }*/

    try {
        const { user } = req;
        const { id } = req.params;
        const { semesters } = req.body;

        // Make sure plan exists already
        const { data: planData, error: planError } = await supabase
            .from('plans')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (planError || !planData) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Update plan data
        const { name: currentName } = planData;
        if (req.body.name) {
            const { error: updateError } = await supabase
                .from('plans')
                .update({ 
                    name: req.body.name ?? currentName, // Use name already in the db if not provided in the request 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', id)
                .eq('user_id', user.id);
        
            if (updateError) {
                //console.error('Update error:', updateError);
                return res.status(500).json({ error: 'Failed to update plan data' });
            }
        }

        /*const { data: updatedPlan, error: updateError } = await supabase
            .from('plans')
            .update({ 
                name, 
                updated_at: new Date().toISOString()  // You can update the updated_at field here
            })
            .eq('id', id)
            .eq('user_id', req.user.id)  // Ensure the user is authorized
            .single();

        if (updateError) {
            return res.status(500).json({ error: 'Failed to update plan data' });
        }*/

        // If semesters are provided, update or insert them
        if (semesters) {
            for (const semester of semesters) {
                // First, check if the semester already exists
                const { data: existingSemester } = await supabase
                    .from('semesters')
                    .select('id')
                    .eq('id', semester.id)
                    .single();

                // If the semester exists, update it, otherwise insert it
                let semesterData;
                if (existingSemester) {
                    const { data } = await supabase
                        .from('semesters')
                        .update({ 
                            term: semester.term 
                        })
                        .eq('id', semester.id)
                        .single();
                    semesterData = data;
                } else {
                    // If the semester does not exist, insert it
                    const { data } = await supabase
                        .from('semesters')
                        .insert([{ 
                            plan_id: id, 
                            term: semester.term 
                        }])
                        .single();
                    semesterData = data;
                }

                // If semester_courses are provided, update or insert them for each semester
                if (semester.semester_courses) {
                    // Delete all existing semester_courses for this semester before inserting/updating
                    await supabase
                        .from('semester_courses')
                        .delete()
                        .eq('semester_id', semesterData.id);

                    // Insert the new semester_courses
                    for (const course of semester.semester_courses) {
                        await supabase
                            .from('semester_courses')
                            .insert([{ 
                                semester_id: semesterData.id, 
                                course_id: course 
                            }]);
                    }
                }
            }
        }

        // Retrieve the updated plan
        /*const { updatedPlan, error } = await supabase
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
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (!updatedPlan) return res.status(404).json({ error: 'Strange, updated plan not found' });
        if (error) throw error;

        // Return the updated plan data
        res.json({ plan: updatedPlan });*/
        
        res.json({ message: 'Plan updated successfully!' });
    } catch (error) {
        console.error('Error updating plan: ', error.message);
        res.status(500).json({ error: 'Failed to update plan' });
    }  
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