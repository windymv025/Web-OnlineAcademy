const express = require('express');
const auth = require('../../middleware/auth');
const categoryModel = require('../../models/category.model');
const courseModel = require('../../models/course.model');
const StringUtil = require('../../utils/StringUtil');

let router = express.Router();
let app = express()


router.get(`/user/:id/watch-list`, auth, (req, res) => {
    let course = courseModel.getCourseWatchList(Number(req.params.id))
    Promise.all([course]).then(rows => {
        rows[0].map(item => {
            let newPrice = ''
            if (item.promo_price != null) {
                newPrice = StringUtil.formatStringCashNoUnit(item.promo_price) + ' (' + StringUtil.formatStringCashNoUnit(item.price) + ')'
            } else {
                newPrice = StringUtil.formatStringCashNoUnit(item.price)
            }
            item.price = newPrice
        });
        res.render('user/watchList', {
            layout: 'main',
            empty: rows[0].length == 0,
            courses: rows[0]
        }).catch(function (err) {
            console.error(err);
            res.send('View error log at server console.');
        });
    })
})

router.get(`/user/:id/subscription`, auth, (req, res) => {
    let course = courseModel.getCourseSubscriptions(Number(req.params.id))
    Promise.all([course]).then(rows => {
        res.render('user/subscription', {
            layout: 'main',
            empty: rows[0].length == 0,
            courses: rows[0]
        }).catch(function (err) {
            console.error(err);
            res.send('View error log at server console.');
        });
    })
})

router.get(`/user/:id/post`, auth, (req, res) => {
    let course = courseModel.getCourseSubscriptions(Number(req.params.id))
    Promise.all([course]).then(rows => {
        rows[0].map(item => {
            let newPrice = ''
            if (item.promo_price != null) {
                newPrice = StringUtil.formatStringCashNoUnit(item.promo_price) + ' (' + StringUtil.formatStringCashNoUnit(item.price) + ')'
            } else {
                newPrice = StringUtil.formatStringCashNoUnit(item.price)
            }
            item.price = newPrice
        });
        res.render('user/coursePost', {
            layout: 'main',
            empty: rows[0].length == 0,
            courses: rows[0]
        }).catch(function (err) {
            console.error(err);
            res.send('View error log at server console.');
        });
    })
})


router.get(`/`, (req, res) => {
    let pageSize = req.query.pageSize
    let page = req.query.page - 1
    const p = courseModel.allActive(page, pageSize);
    const numTotal = courseModel.countActive();
    Promise.all([p, numTotal]).then(function (rows) {
        let totalPage = Math.ceil(rows[1][0].count / pageSize)
        rows[0].map(item => {
            let newPrice = ''
            if (item.promo_price != null) {
                newPrice = StringUtil.formatStringCashNoUnit(item.promo_price) + ' (' + StringUtil.formatStringCashNoUnit(item.price) + ')'
            } else {
                newPrice = StringUtil.formatStringCashNoUnit(item.price)
            }
            item.price = newPrice
        });
        res.render('course/index', {
            layout: 'main',
            courses: rows[0],
            empty: rows[0].length === 0,
            totalPage: Number(totalPage),
            currentPage: Number(page) + 1,
            nextPage: Number(page) + 2 > Number(totalPage) ? Number(totalPage) : Number(page) + 2,
            prevPage: Number(page) <= 0 ? Number(page) + 1 : Number(page)
        });
    }).catch(function (err) {
        console.error(err);
        res.send('View error log at server console.');
    });
})


router.get(`/:id/detail`, (req, res) => {
    let id = Number(req.params.id)
    let courseDetail = courseModel.byId(id);
    let courseChapter = courseModel.getCourseChapter(id);
    let gv = courseModel.getSubscription(id, 1);
    let student = courseModel.getSubscription(id, 2);
    let review = courseModel.getCourseReview(id)
    Promise.all([courseDetail, courseChapter, gv, student, review]).then((rows) => {
        let detail = rows[0][0];
        let newPrice = ''
        if (detail.promo_price != null) {
            newPrice = StringUtil.formatStringCashNoUnit(detail.promo_price) + ' (' + StringUtil.formatStringCashNoUnit(detail.price) + ')'
        } else {
            newPrice = StringUtil.formatStringCashNoUnit(detail.price)
        }
        detail.price = newPrice
        let chaps = rows[1];
        let lectures = rows[2][0];
        let students = rows[3];
        let reviews = rows[4];
        let lessonP = []
        chaps.forEach((item) => {
            lessonP.push(courseModel.getCourseLesson(id, item.id))
        })
        Promise.all(lessonP).then((lesson) => {
            let resourceP = []
            let lessons = []
            lesson.forEach(les => {
                les.forEach(l => {
                    lessons.push(l)
                    resourceP.push(courseModel.getCourseResource(null, null, l.id))
                })
            })
            Promise.all(resourceP).then(re => {
                lessons.map((le) => {
                    let res = []
                    re.forEach(r => {
                        if (r != null && r[0].lesson_id == le.id) {
                            res.push(r[0])
                        }
                    })
                    le.resources = res
                })
                chaps.map((c) => {
                    let z = []
                    lessons.forEach(i => {
                        if (i.chapter_id == c.id) {
                            z.push(i)
                        }
                    })
                    return c.lessons = z
                })
                res.render('course/detail', {
                    layout: 'main',
                    detail: detail,
                    chapters: chaps,
                    lectures: lectures,
                    students: students,
                    reviews: reviews
                });
            })
        })
    }).catch(function (err) {
        console.error(err);
        res.send('View error log at server console.');
    });
})



router.post(`/:id/review`, auth, (req, res) => {
    let userId = req.user.id
    let content = req.body.content
    courseModel.addReview(content, req.params.id, userId).then(()=>{
        res.redirect(req.header('Referer'))
    })
})

module.exports = router;
