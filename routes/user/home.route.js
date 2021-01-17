const express = require('express');
const categoryModel = require('../../models/category.model');
const courseModel = require('../../models/course.model');
const StringUtil = require('../../utils/StringUtil');

let router = express.Router();
let app = express()

router.get('/', async function (req, res) {
    let courseNews = courseModel.getNewCourses();
    let courseTopView = courseModel.getCourseTopView();
    Promise.all([courseNews, courseTopView]).then(rows => {
        rows[0].map(item => {
            let newPrice = ''
            if (item.promo_price != null) {
                newPrice = StringUtil.formatStringCashNoUnit(item.promo_price) + ' (' + StringUtil.formatStringCashNoUnit(item.price) + ')'
            } else {
                newPrice = StringUtil.formatStringCashNoUnit(item.price)
            }
            item.price = newPrice
        });
        rows[1].map(item => {
            let newPrice = ''
            if (item.promo_price != null) {
                newPrice = StringUtil.formatStringCashNoUnit(item.promo_price) + ' (' + StringUtil.formatStringCashNoUnit(item.price) + ')'
            } else {
                newPrice = StringUtil.formatStringCashNoUnit(item.price)
            }
            item.price = newPrice
        });

        res.render('user/home', {
            layout: 'main',
            newCourses: rows[0],
            topViewCourse: rows[1]
        })
    })
})

module.exports = router;
