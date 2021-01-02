var db = require('../utils/db');
const TBL_CATEGORIES = 'category';

module.exports = {
    allchild: () => {
        return db.load(`select * from category where parent_id != 'null'`)
    },
    byId: (id) => {
        return db.load(`select * from category where id=${id}`)
    },
    updateName: (name, id) => {
        return db.load(`update category set name = '${name}' where id = ${id}`);
    },

    all() {
        return db.load(`select * from ${TBL_CATEGORIES}`);
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

    del(entity) {
        const condition = { CatID: entity.CatID };
        return db.del(condition, TBL_CATEGORIES);
    },

    patch(entity) {
        const condition = { CatID: entity.CatID };
        delete entity.CatID;
        return db.patch(entity, condition, TBL_CATEGORIES);
    }
}