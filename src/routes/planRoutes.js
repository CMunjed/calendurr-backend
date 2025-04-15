const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    getPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan
 } = require('../controllers/planController');


router.use(authMiddleware);         // Apply authentication middleware to all these routes.


router.get('/', getPlans);          // GET /plans
router.get('/:id', getPlanById);    // GET /plans/:id
router.post('/', createPlan);       // POST /plans
router.put('/:id', updatePlan);     // PUT /plans/:id
router.delete('/:id', deletePlan);  // DELETE /plans/:id


module.exports = router;