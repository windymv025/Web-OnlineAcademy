var mysql = require('mysql');

var createConnection = () => {
    return mysql.createConnection({
        host: 'sql12.freemysqlhosting.net',
        port: 3306,
        user: 'sql12386700',
        password: '9uzA19IxxS',
        database: 'sql12386700'
    });
}

module.exports = {
    load: sql => {
        return new Promise((resolve, reject) => {
            var connection = createConnection();
            connection.connect();
            connection.query(sql, (error, results, fields) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
                connection.end();
            });
        });
    },
    singleByEmail: (email) => {
        return new Promise((resolve, reject) => {
            let conn = createConnection();
            conn.connect();
            let sql = `select * from users where email = ${email} and status = 1 `
            conn.query(sql, (err, value) => {
                if (err) reject(err);
                else {
                    resolve(value);
                }
                conn.end();
            })
        })
    },
    add: (tableName, entity) => {
        return new Promise((resolve, reject) => {
            var sql = `insert into ${tableName} set ?`;
            var connection = createConnection();
            connection.connect();
            connection.query(sql, entity, (error, value) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(value);
                }
                connection.end();
            });
        });
    },

    update: (tableName, idField, entity) => {
        return new Promise((resolve, reject) => {
            var id = entity[idField];
            delete entity[idField];

            var sql = `update ${tableName} set ? where ${idField} = ?`;
            var connection = createConnection();
            connection.connect();
            connection.query(sql, [entity, id], (error, value) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(value.changedRows);
                }
                connection.end();
            });
        });
    },

    delete: (tableName, idField, id) => {
        return new Promise((resolve, reject) => {
            var sql = `update ${tableName} set status = -1 where ${idField} = ${id}`;
            var connection = createConnection();
            connection.connect();
            connection.query(sql, id, (error, value) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(value.affectedRows);
                }
                connection.end();
            });
        });
    },
};