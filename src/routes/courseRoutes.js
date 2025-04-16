const express = require('express');
const router = express.Router();

const { 
    getCourses,
    getCourseById
 } = require('../controllers/courseController');


 router.get('/', getCourses);           // GET /courses
 router.get('/:id', getCourseById);     // GET /courses/:id

 
 module.exports = router;