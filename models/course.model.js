var db = require('../utils/db');
const TBL_COURSE = 'courses';

module.exports = {
    byId: (id) => {
        const rows = db.load(`select * from ${TBL_COURSE} where id = ${id} and status != -1 `);
        return rows;
    },
    all: (page, pageSize, orderBy = 'cs.created_at desc') => {
        let sql = `select cs.*, c.name catName, u.name createdName from ${TBL_COURSE} cs join 
        category c on c.id = cs.category_id and c.status !=  -1
        left join users u on u.id = cs.created_by and u.status = 1
        where cs.status != -1 order by ${orderBy}  `
        if (page != null) {
            let offset = Number(page) * Number(pageSize)
            sql = sql + ` limit ${pageSize} offset ${offset} `
        }
        return db.load(sql);
    },
    async count() {
        let sql = `select count(*) count from ${TBL_COURSE} cs join 
        category c on c.id = cs.category_id and c.status != -1
        left join users u on u.id = cs.created_by and u.status = 1
        where cs.status != -1`

        return await db.load(sql);
    },
    async delete(id) {
        let sql = `update ${TBL_COURSE} set status = -1 where id = ${parseInt(id)}`
        let result = await db.load(sql)
        return result;
    },
    async block(id) {
        let sql = `update ${TBL_COURSE} set status = 2 where id = ${parseInt(id)}`
        let result = await db.load(sql)
        return result;
    },
    async unBlock(id) {
        let sql = `update ${TBL_COURSE} set status = 1 where id = ${parseInt(id)} and status = 2`
        let result = await db.load(sql)
        return result;
    },
    patch(entity) {
        const condition = { CatID: entity.CatID };
        delete entity.CatID;
        return db.patch(entity, condition, TBL_COURSE);
    },
    async getCourseChapter(courseId) {
        let sql = `select * from course_chapters where course_id = ${courseId} and status = 1 order by chapter asc `
        let result = await db.load(sql);
        return result;
    },
    async getCourseLesson(courseId, courseChapter) {
        let sql = `select * from course_lessons where course_id = ${courseId} and chapter_id = ${courseChapter} and status = 1 order by lesson asc `
        let result = db.load(sql);
        return await result;
    },
    getCourseResource: (courseId, chapterId, lessonId) => {
        let sql = `select * from course_resource where status = 1 `
        if (courseId) {
            sql = sql + `and course_id = ${courseId} `
        }
        if (chapterId) {
            sql = sql + `and chapter_id =${chapterId} `
        }
        if (lessonId) {
            sql = sql + `and lesson_id =${lessonId} `
        }
        sql = sql + ` order by created_at desc `
        let result = db.load(sql);
        return result;
    },
    async getSubscription(courseId, type) {
        let sql = `select u.* from subscriptions s join users u on u.id = s.user_id where s.course_id = ${courseId} and s.status = 1 and u.status = 1 and s.type = ${type} and u.type = ${type} order by s.created_at desc `
        let result = await db.load(sql);
        return result;
    },
    async getCourseReview(courseId) {
        let sql = `select u.* , r.*  from review r join users u on u.id = r.user_id where r.status =1 and u.status = 1 and r.course_id = ${courseId}  order by r.created_at desc `
        let result = await db.load(sql);
        return result;
    },
    async getNewCourses() {
        let sql = `select cs.*, c.name catName, u.name createdName from ${TBL_COURSE} cs join 
        category c on c.id = cs.category_id and c.status = 1
        left join users u on u.id = cs.created_by
        where cs.status = 1 order by created_at desc limit 10 `
        return db.load(sql);
    },
    async getCourseTopView() {
        let sql = `select cs.*, c.name catName, u.name createdName, sb.count
        from courses cs join 
                category c on c.id = cs.category_id and c.status = 1
                join (select s.course_id, count(*) count from subscriptions s
                 where s.status = 1 and s.type = 2 group by s.course_id order by count desc) sb on sb.course_id = cs.id
                left join users u on u.id = cs.created_by        
                where cs.status = 1 limit 10 `

        return db.load(sql);
    },
}