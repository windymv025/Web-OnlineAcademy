express = require('express');
let moment = require('moment');

let authAdmin = require('../../middleware/isAdmin');

let categoryModel = require('../../models/category.model');

let auth = require('../../middleware/auth');

let UserModel = require('../../models/user.model');
const { now } = require('moment');


let router = express.Router();

router.get('/manageCategories', authAdmin, (req, res, next) => {
    categoryModel.all()
        .then((category) => {
            let parentCat = [];
            let childCat = [];
            category.forEach(row => {
                if (row.parent_id === null) {
                    parentCat.push(row);
                } else {
                    childCat.push(row);
                }
            });
            parentCat.forEach((row, index) => {
                let children = [];
                childCat.forEach(rowchild => {
                    if (rowchild.parent_id === row.id)
                        children.push(rowchild);
                })
                parentCat[index] = { row, children };
            })
            res.render('admin/manageCategories', { layout: 'main', categories: parentCat });
        }).catch(err => {
            throw err;
        })

});


router.get('/category', async function (req, res) {
    const rows = await categoryModel.all();
    // res.render('categories/index', {
    //   categories: rows,
    //   empty: rows.length === 0
    // });

    const p = categoryModel.all();
    p.then(function (rows) {
        res.render('category/index', {
            categories: rows,
            empty: rows.length === 0
        });
    }).catch(function (err) {
        console.error(err);
        res.send('View error log at server console.');
    });

    db.load('select * from category', function (rows) {
        res.render('category/index', {
            category: rows,
            empty: rows.length === 0
        });
    });
})

router.get('/category/add', function (req, res) {
    res.render('category/add');
})

router.post('/category/add', async function (req, res) {
    let entity;
    let name = req.body.categoryName;
    let parent_id;
    if (req.body.parent != '0') {
        parent_id = parseInt(req.body.parent);
    }
    entity = {
        name: name,
        created_at: now(),
        status: 1
    }
    categoryModel.add(entity)
        .then(() => {
            res.redirect('/admin/category');
        })
        .catch(err => {
            throw err;
        })
})

router.post('/manageCategories/:id', authAdmin, (req, res, next) => {
    categoryModel.updateName(req.body.categoryName, req.params.id)
        .then(() => {
            res.redirect('/admin/manageCategories');
        })
        .catch(err => {
            throw err;
        })

});
router.post('/manageCategories', authAdmin, (req, res, next) => {
    let entity;
    let name = req.body.categoryName;
    let parent_id;
    if (req.body.parent != '0') {
        parent_id = parseInt(req.body.parent);
    }
    entity = {
        name,
        parent_id
    }
    categoryModel.add(entity)
        .then(() => {
            res.redirect('/admin/manageCategories');
        })
        .catch(err => {
            throw err;
        })
});

router.use('/user-management', authAdmin, (req, res) => {
    console.log("route admin", req);
    // res.render('admin/manageUser', {
    //     layout: 'main',
    //     usernormal: [],
    //     writer: [],
    //     editor: [],
    //     categories: []
    // });
    let filter = {
        page: 0,
        pageSize: 1,
        type: 2,
        status: 1
    }

    let users = UserModel.search(filter);
    let childCat = [];
    res.app.locals.category.forEach(row => {
        if (row.parent_id !== null) {
            childCat.push(row);
        }
    });

    Promise.all([users, [], []])
        .then(values => {
            let editorWithCategories = []
            values[2].forEach((row, index) => {
                editorWithCategories[index] = { row, childCat }
            })
            res.render('admin/manageUser', {
                layout: 'main',
                usernormal: values[0],
                writer: values[1],
                editor: editorWithCategories,
                categories: childCat
            });
        })

});
router.post('/manageUser/writer/:writerId', authAdmin, (req, res) => {
    let name = req.body.writerName;
    let password = req.body.writerPassword;
    let id = req.params.writerId;
    let input = []
    if (name != '') {
        let updateName = UserModel.updateName(name, id);
        input.push(updateName)
    }
    if (password != '') {
        let saltround = 10;
        let hash = bcrypt.hashSync(password, saltround);
        let updatePassword = UserModel.updatePassword(hash, id);
        input.push(updatePassword);
    }
    Promise.all(input)
        .then(() => {
            res.redirect('/admin/manageUser');
        })
        .catch((err) => {
            throw err;
        })
});

router.post('/manageUser/editor/:editorId', authAdmin, (req, res) => {
    let name = req.body.editorName;
    let password = req.body.editorPassword;
    let id = req.params.editorId;
    let manage_category = req.body.CategoryManage;
    let input = []
    if (name != '') {
        let updateName = UserModel.updateName(name, id);
        input.push(updateName)
    }
    if (password != '') {
        let saltround = 10;
        let hash = bcrypt.hashSync(password, saltround);
        let updatePassword = UserModel.updatePassword(hash, id);
        input.push(updatePassword);
    }
    let updateManageCategory = UserModel.updateCategoryManage(manage_category, id);
    input.push(updateManageCategory);
    Promise.all(input)
        .then(() => {
            res.redirect('/admin/manageUser');
        })
        .catch((err) => {
            throw err;
        })
});

router.post('/manageUser/user/:userId', authAdmin, (req, res) => {
    let name = req.body.userName;
    let password = req.body.userPassword;
    let id = req.params.userId;
    let renew = req.body.renew;
    let input = [];
    if (name != '') {
        let updateName = UserModel.updateName(name, id);
        input.push(updateName)
    }
    if (password != '') {
        let saltround = 10;
        let hash = bcrypt.hashSync(password, saltround);
        let updatePassword = UserModel.updatePassword(hash, id);
        input.push(updatePassword);
    }
    if (renew == 'on') {
        let expiry_date = moment().add(7, 'days');
        expiry_date = moment(expiry_date).format('YYYY-MM-DD');
        let renewUser = UserModel.renewUser(expiry_date, id);
        input.push(renewUser);
    }
    Promise.all(input)
        .then(() => {
            res.redirect('/admin/manageUser');
        })
        .catch((err) => {
            throw err;
        })
});

router.post('/manageUser/delete/:id', authAdmin, (req, res) => {
    UserModel.InactiveUser(req.params.id)
        .then(() => {
            res.redirect('/admin/manageUser');
        })
})

router.post('/manageUser/user', authAdmin, (req, res) => {
    let name = req.body.nameUser;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let saltround = 10;
    let hash = bcrypt.hashSync(password, saltround);
    let expiry_date = moment().add(7, 'days');
    expiry_date = moment(expiry_date).format('YYYY-MM-DD');
    let entity = {
        username,
        password: hash,
        name,
        email,
        expiry_date,
        role: 'user'
    }
    UserModel.add(entity)
        .then(() => res.redirect('/admin/manageUser'))
        .catch(err => {
            throw err;
        })
});
router.post('/manageUser/writer', authAdmin, (req, res) => {
    let name = req.body.nameWriter;
    let email = req.body.emailWriter;
    let username = req.body.username;
    let password = req.body.passwordWriter;
    let saltround = 10;
    let hash = bcrypt.hashSync(password, saltround);
    let entity = {
        username,
        password: hash,
        name,
        email,
        role: 'writer'
    }
    UserModel.add(entity)
        .then(() => res.redirect('/admin/manageUser'))
        .catch(err => {
            throw err;
        })
})
router.post('/manageUser/editor', authAdmin, (req, res) => {
    let name = req.body.nameEditor;
    let email = req.body.emailEditor;
    let username = req.body.username;
    let password = req.body.passwordEditor;
    let manage_category = req.body.CategoryManage;
    let saltround = 10;
    let hash = bcrypt.hashSync(password, saltround);
    let entity = {
        username,
        password: hash,
        name,
        email,
        manage_category,
        role: 'editor'
    }
    UserModel.add(entity)
        .then(() => res.redirect('/admin/manageUser'))
        .catch(err => {
            throw err;
        })
})

module.exports = router;