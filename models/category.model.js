var db = require('../utils/db');
const TBL_CATEGORIES = 'category';

module.exports = {
    allchild: (page, pageSize, status = 1) => {
        let sql = `select * from category where parent_category_id is not null `
        if (status == 1) {
            sql = sql + ` and status = 1 `
        }
        sql = sql` order by created_at desc`
        if (page != null) {
            let offset = Number(page) * Number(pageSize)
            sql = sql + ` limit ${pageSize} offset ${offset} `
        }
        return db.load(sql)
    },
    allParent: (page, pageSize, status = 1) => {
        let sql = `select * from category where parent_category_id is null  `
        if (status == 1) {
            sql = sql + ` and status = 1 `
        }
        sql = sql + ` order by status desc,  created_at desc`
        if (page != null) {
            let offset = Number(page) * Number(pageSize)
            sql = sql + ` limit ${pageSize} offset ${offset} `
        }
        return db.load(sql)
    },
    byId: (id) => {
        return db.load(`select * from category where id=${id}`)
    },
    updateName: (name, id) => {
        return db.load(`update category set name = '${name}' where id = ${id}`);
    },
    update: (name, id) => {
        return db.load(`update category set name = '${name}' where id = ${id}`);
    },
    all() {
        return db.load(`select * from ${TBL_CATEGORIES}`);
    },
    childByParent: (id, status = 1) => {
        let sql = `select * from category where parent_category_id  = ${id}    `
        if (status == 1) {
            sql = sql + ` and status = 1 `
        }
        sql = sql + ` order by created_at desc desc`
        return db.load(sql)
    },

    allWithDetails() {
        const sql = `
            select c.*, count(p.ProID) as ProductCount
            from categories c left join products p on c.CatID = p.CatID
            group by c.CatID, c.CatName
        `;
        return db.load(sql);
    },

    async single(id) {
        const rows = await db.load(`select * from ${TBL_CATEGORIES} where CatID = ${id}`);
        if (rows.length === 0)
            return null;

        return rows[0];
    },

    add(entity) {
        let e = entity
        return db.add(TBL_CATEGORIES, entity)
    },

    async del(id) {
        let result = await db.delete(TBL_CATEGORIES, 'id', parseInt(id))
        return result;
    },

    patch(entity) {
        const condition = { CatID: entity.CatID };
        delete entity.CatID;
        return db.patch(entity, condition, TBL_CATEGORIES);
    },
    async childByParentId(id) {
        let result = await db.load(`select * from category where parent_category_id  = ${id}  and status = 1 order by created_at desc`)
        return result
    },
}