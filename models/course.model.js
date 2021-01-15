var db = require('../utils/db');
const TBL_COURSE = 'courses';

module.exports = {
    byId: (id) => {
        const rows = db.load(`select * from ${TBL_COURSE} where id = ${id}`);
        if (rows.length === 0)
            return null;
        return rows[0];
    },
    all: (page, pageSize, orderBy = 'cs.created_at desc') => {
        let sql = `select cs.*, c.name catName, u.name createdName from ${TBL_COURSE} cs join 
        category c on c.id = cs.category_id and c.status = 1
        left join users u on u.id = cs.created_by and u.status = 1
        where cs.status = 1 order by ${orderBy}  `
        if (page != null) {
            let offset = Number(page) * Number(pageSize)
            sql = sql + ` limit ${pageSize} offset ${offset} `
        }
        return db.load(sql);
    },
    async count() {
        let sql = `select count(*) count from ${TBL_COURSE} cs join 
        category c on c.id = cs.category_id and c.status = 1
        left join users u on u.id = cs.created_by and u.status = 1
        where cs.status = 1`

        return await db.load(sql);
    },

    async delete(id) {
        let sql = `update ${TBL_COURSE} set status = -1 where id = ${parseInt(id)}`
        let result = await db.load(sql)
        return result;
    },

    patch(entity) {
        const condition = { CatID: entity.CatID };
        delete entity.CatID;
        return db.patch(entity, condition, TBL_COURSE);
    }
}