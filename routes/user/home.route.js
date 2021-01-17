const express = require('express');
const categoryModel = require('../../models/category.model');
const courseModel = require('../../models/course.model');

let router = express.Router();
let app = express()

router.get('/', async function (req, res) {
    let courseNews = courseModel.getNewCourses();
    let courseTopView = courseModel.getCourseTopView();
    Promise.all([courseNews, courseTopView]).then(rows => {


        res.render('user/home', {
            layout: 'main',
            newCourses: rows[0],
            topViewCourse: rows[1]
        })
    })
})

module.exports = router;
