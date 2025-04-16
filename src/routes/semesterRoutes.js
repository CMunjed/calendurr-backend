const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const { 
    getSemestersInPlan,
    getSemesterById,
    createSemester,
    updateSemester,
    deleteSemester
 } = require('../controllers/semesterController');


router.use(authMiddleware);         // Apply authentication middleware to all these routes.


router.get('/plans/:id/semesters', getSemestersInPlan); // GET /plans/:id/semesters
router.get('/semesters/:id', getSemesterById);          // GET /semesters/:id
router.post('/semesters', createSemester);              // POST /semesters
router.put('/semesters/:id', updateSemester);           // PUT /semesters/:id
router.delete('/semesters/:id', deleteSemester);        // DELETE /semesters/:id


module.exports = router;