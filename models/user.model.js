let db = require('../utils/db');

module.exports = {
    add: (entity) => {
        return db.add('users', entity);
    },
    singleByEmail: (email) => {
        let sql = `select * from users where email = '${email}' and status = 1 limit 1 `
        return db.load(sql);
    },
    singleById: (id) => {
        return db.load(`select * from users where id=${sid}`)
    },
    search: (filter) => {
        let sql = `select u.* from users u where `
        Object.keys(filter).forEach((item, index) => {
            if (item != 'page' && item != 'pageSize' && item != 'orderBy' && item != 'singleResult') {
                sql = sql + ` u.${item} = ${filter[item]} and`
            }
        })
        sql = sql + ' 1 = 1 '
        if (filter.orderBy) {
            sql = sql + ` order by `
            Object.keys(filter.orderBy).forEach((item, index) => {
                sql = sql + ` u.${item} ${filter.orderBy[item]} `
                if (index < Object.keys(filter.orderBy).length - 1) {
                    sql = sql + ' , '
                }
            })
        }
        if (filter.singleResult) {
            sql = sql + ' limit 1 '
        } else {
            if (filter.page != null) {
                let offset = Number(filter.page) * Number(filter.pageSize)
                sql = sql + ` LIMIT  ${filter.pageSize} offset ${offset} `
            }
        }
        return db.load(sql)
    },
    allByRole: (role) => {
        let sql = `select * from user where role = '${role}' and status='active'`;
        return db.load(sql);
    },
    delete: (id) => {
        let sql = `update users set status = -1 where id = ${id} `
        return db.load(sql)
    },
    allEditor: () => {
        let sql = `select user.*, category.id as categoryId, category.name as categoryName
        from user join category on user.manage_category = category.id 
        where role = 'editor' and status='active'`
        return db.load(sql);
    },
    updateName: (name, id) => {
        let sql = `update users set name='${name}' where id =${id}`;
        return db.load(sql);
    },
    updateEmail: (email, id) => {
        let sql = `update users set email='${email}' where id =${id}`;
        return db.load(sql);
    },
    updatePassword: (password, id) => {
        let sql = `update user set password = '${password}' where id = ${id}`;
        return db.load(sql);
    },
    update: (entity) => {
        return db.update('users', 'id', entity);
    }
}