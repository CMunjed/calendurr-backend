const supabase = require('../config/supabaseClient');

// GET /courses
const getCourses = async (req, res) => {
    try {
        //id, name, code, credit_hours, 
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                course_type:course_types(type),
                course_coreqs:course_coreqs!course_coreqs_course_id_fkey (
                    coreq:coreq_id (
                        *
                    ),
                    is_prereq
                )
            `);

        if (error) throw error;

        res.json({ courses: data });
    } catch (error) {
        console.error('Error fetching courses: ', error.message);
        res.status(500).json({ error: 'Failed to retrieve courses' });
    }
};

// GET /courses/:id
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                course_type:course_types(type),
                course_coreqs:course_coreqs!course_coreqs_course_id_fkey (
                    coreq:coreq_id (
                        *
                    ),
                    is_prereq
                )
            `)
            .eq('id', id)
            .single();

        if (!data) return res.status(404).json({ error: 'Course not found' });
        if (error) throw error;

        res.json({ course: data });
    } catch (error) {
        console.error('Error fetching course: ', error.message);
        res.status(500).json({ error: 'Failed to retrieve course' });
    }
};

module.exports = {
    getCourses,
    getCourseById,
}