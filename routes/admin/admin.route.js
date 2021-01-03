express = require('express');
let moment = require('moment');

let authAdmin = require('../../middleware/isAdmin');

let categoryModel = require('../../models/category.model');

let auth = require('../../middleware/auth');

let UserModel = require('../../models/user.model');
const { now } = require('moment');
const stringUtil = require('../../utils/StringUtil');
const userModel = require('../../models/user.model');
const bcrypt = require('bcrypt');
const userType = require('../../enum/userType');


let router = express.Router();

router.get('/category', async function (req, res) {
    const p = categoryModel.allParent();
    p.then(function (rows) {
        res.render('category/index', {
            categories: rows,
            empty: rows.length === 0
        });
    }).catch(function (err) {
        console.error(err);
        res.send('View error log at server console.');
    });
})

router.get('/category/add', function (req, res) {
    const parents = categoryModel.allParent()
    parents.then(function (item) {
        res.render('category/add', {
            parents: item
        });
    })
})

router.post('/category/add', async function (req, res) {
    let entity;
    let name = req.body.categoryName;
    let parent_id = res.body ? res.body.parentCategory ? Number(res.body.parentCategory) != -1 ? res.body.parentCategory : null : null : null;

    entity = {
        name: name,
        created_at: new Date(),
        status: 1,
        parent_category_id: parent_id ? parseInt(parent_id) : null
    }
    categoryModel.add(entity)
        .then(() => {
            res.redirect('/admin/category');
        })
        .catch(err => {
            throw err;
        })
})

router.post('/category/:id/add-child', async function (req, res) {
    let entity;
    let name = req.body.nameChild;
    let parent_id = req.params.id

    entity = {
        name: name,
        created_at: new Date(),
        status: 1,
        parent_category_id: parseInt(parent_id)
    }
    categoryModel.add(entity)
        .then(() => {
            res.redirect(`/admin/category/${parent_id}`);
        })
        .catch(err => {
            throw err;
        })
})

router.get('/category/:id', function (req, res) {
    categoryModel.byId(req.params.id).then(function (category) {
        const child = categoryModel.childByParent(req.params.id)
        child.then(function (result) {
            res.render('category/edit', {
                category: category[0],
                child: result,
                emptyChild: result.length === 0
            });
        })
    })
})

router.post('/category/:id', authAdmin, (req, res, next) => {
    categoryModel.update(req.body.name, req.params.id)
        .then(() => {
            res.redirect('/admin/category');
        })
        .catch(err => {
            throw err;
        })
});

router.post('/category/delete/:id', authAdmin, (req, res, next) => {
    const ret = categoryModel.del(req.params.id).then(function (result) {
        res.redirect('/admin/category');
    });
});

router.post('/category/delete/:id/child/:childId', authAdmin, (req, res, next) => {
    const ret = categoryModel.del(req.params.childId).then(function (result) {
        res.redirect(`/admin/category/${req.params.id}`);
    });
});

router.post('/category/:id/child/:childId', authAdmin, (req, res, next) => {
    categoryModel.update(req.body.childName, Number(req.params.childId))
        .then(() => {
            res.redirect(`/admin/category/${req.params.id}`);
        })
        .catch(err => {
            throw err;
        })
});

router.get('/lecture', authAdmin, (req, res) => {
    let filter = {
        page: 0,
        pageSize: 10,
        type: 1,
        status: 1,
        orderBy: {
            created_at: 'desc'
        }
    }

    let users = UserModel.search(filter);
    users.then(values => {
        res.render('user/lecture/index', {
            layout: 'main',
            users: values,
            empty: values.length === 0
        });
    })

});

router.get('/lecture/add', authAdmin, (req, res) => {
    res.render('user/lecture/add');
})

router.post('/lecture/add', authAdmin, (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let errorName = null;
    let errorMail = null;
    if (name == null) {
        errorName = 'Vui lòng nhập tên'
    } else if (name.trim() == '') {
        errorName = 'Vui lòng nhập tên'
    } else if (stringUtil.validSpecialCharacter(name)) {
        errorName = 'Vui lòng nhập tên'
    } else if (email == null) {
        errorMail = 'Vui lòng nhập email'
    } else if (email.trim() == '') {
        errorMail = 'Vui lòng nhập email'
    } else if (!stringUtil.validateEmail(email)) {
        errorMail = 'Vui lòng nhập email đúng định dạng'
    }
    if (errorName != null || errorMail != null) {
        res.render('user/lecture/add', {
            errorMail: errorMail,
            errorName: errorName,
        });
    } else {
        let salt = 10;
        let hash = bcrypt.hashSync('00000', salt);
        let entity = {
            name,
            email,
            type: 1,
            status: 1,
            password: hash,
            created_at: new Date()
        }
        userModel.add(entity).then(() => res.redirect('/admin/lecture'))
            .catch(err => {
                throw err;
            })
    }

})

router.get('/lecture/:id', authAdmin, (req, res) => {
    let filter = {
        id: req.params.id,
        type: 1,
        status: 1,
        singleResult: true
    }

    let users = UserModel.search(filter);
    users.then(values => {
        res.render(`user/lecture/edit`, {
            layout: 'main',
            user: values[0],
        });
    })
})

router.post('/lecture/:id', authAdmin, (req, res) => {
    let user = userModel.singleById(req.params.id)
    let name = req.body.name;
    let email = req.body.email;
    let errorName = null;
    let errorMail = null;
    if (name == null) {
        errorName = 'Vui lòng nhập tên'
    } else if (name.trim() == '') {
        errorName = 'Vui lòng nhập tên'
    } else if (stringUtil.validSpecialCharacter(name)) {
        errorName = 'Vui lòng nhập tên'
    } else if (email == null) {
        errorMail = 'Vui lòng nhập email'
    } else if (email.trim() == '') {
        errorMail = 'Vui lòng nhập email'
    } else if (!stringUtil.validateEmail(email)) {
        errorMail = 'Vui lòng nhập email đúng định dạng'
    }
    if (errorName != null || errorMail != null) {
        Promise.all([user])
            .then((resultUser) => {
                res.render(`user/lecture/edit`, {
                    errorMail: errorMail,
                    errorName: errorName,
                    user: {
                        ...resultUser[0][0],
                        name: name,
                        email: email
                    }
                });
            })
            .catch((err) => {
                throw err;
            })
    } else {
        let entity = {
            id: req.params.id,
            name,
            email,
            updated_at: new Date()
        }
        userModel.update(entity).then(() => res.redirect(`/admin/lecture/${req.params.id}`))
            .catch(err => {
                throw err;
            })
    }
})

router.post('/lecture/delete/:id', authAdmin, (req, res, next) => {
    userModel.delete(req.params.id).then(function (result) {
        res.redirect('/admin/lecture');
    });
});

router.get('/student', authAdmin, (req, res) => {
    let filter = {
        page: 0,
        pageSize: 10,
        type: 2,
        status: 1,
        orderBy: {
            created_at: 'desc'
        }
    }

    let users = UserModel.search(filter);
    users.then(values => {
        res.render('user/student/index', {
            layout: 'main',
            users: values,
            empty: values.length === 0
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