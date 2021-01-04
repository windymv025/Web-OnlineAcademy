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

router.get('/', authAdmin, async function (req, res) {
    res.redirect('/admin/category?page=1&pageSize=5')
})

router.get('/category', authAdmin, async function (req, res) {
    let pageSize = req.query.pageSize
    let page = req.query.page - 1
    const p = categoryModel.allParent();
    const cat = categoryModel.allParent(page, pageSize)
    Promise.all([cat, p])
        .then((result) => {
            let totalPage = Math.ceil(result[1].length / pageSize)
            res.render(`category/index`, {
                categories: result[0],
                empty: result[0].length === 0,
                totalPage: Number(totalPage),
                currentPage: Number(page) + 1,
                nextPage: Number(page) + 2 > Number(totalPage) ? Number(totalPage) : Number(page) + 2,
                prevPage: Number(page) <= 0 ? Number(page) + 1 : Number(page)
            });
        })
        .catch((err) => {
            throw err;
        })
})

router.get('/category/add', authAdmin, function (req, res) {
    const parents = categoryModel.allParent()
    parents.then(function (item) {
        res.render('category/add', {
            parents: item
        });
    })
})

router.post('/category/add', authAdmin, async function (req, res) {
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

router.post('/category/:id/add-child', authAdmin, async function (req, res) {
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

router.get('/category/:id', authAdmin, function (req, res) {
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
    let pageSize = req.query.pageSize
    let page = req.query.page - 1
    let filterAll = {
        type: 1,
        status: 1,
        orderBy: {
            created_at: 'desc'
        }
    }
    let p = userModel.search(filterAll);
    let filter = {
        page: page,
        pageSize: pageSize,
        type: 1,
        status: 1,
        orderBy: {
            created_at: 'desc'
        }
    }
    let users = userModel.search(filter);
    Promise.all([users, p])
        .then((result) => {
            let totalPage = Math.ceil(result[1].length / pageSize)
            res.render('user/lecture/index', {
                layout: 'main',
                users: result[0],
                empty: result[0].length === 0,
                totalPage: Number(totalPage),
                currentPage: Number(page) + 1,
                nextPage: Number(page) + 2 > Number(totalPage) ? Number(totalPage) : Number(page) + 2,
                prevPage: Number(page) <= 0 ? Number(page) + 1 : Number(page)
            });
        })
        .catch((err) => {
            throw err;
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
        userModel.update(entity).then(() => res.redirect(`/admin/lecture`))
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
    let pageSize = req.query.pageSize
    let page = req.query.page - 1
    let filterAll = {
        type: 2,
        status: 1,
        orderBy: {
            created_at: 'desc'
        }
    }
    let p = userModel.search(filterAll);
    let filter = {
        page: page,
        pageSize: pageSize,
        type: 2,
        status: 1,
        orderBy: {
            created_at: 'desc'
        }
    }
    let users = userModel.search(filter);
    Promise.all([users, p])
        .then((result) => {
            let totalPage = Math.ceil(result[1].length / pageSize)
            res.render('user/student/index', {
                layout: 'main',
                users: result[0],
                empty: result[0].length === 0,
                totalPage: Number(totalPage),
                currentPage: Number(page) + 1,
                nextPage: Number(page) + 2 > Number(totalPage) ? Number(totalPage) : Number(page) + 2,
                prevPage: Number(page) <= 0 ? Number(page) + 1 : Number(page)
            });
        })
        .catch((err) => {
            throw err;
        })
});


router.get('/student/:id', authAdmin, (req, res) => {
    let filter = {
        id: req.params.id,
        type: 2,
        status: 1,
        singleResult: true
    }

    let users = UserModel.search(filter);
    users.then(values => {
        res.render(`user/student/edit`, {
            layout: 'main',
            user: values[0],
        });
    })
})

router.post('/student/:id', authAdmin, (req, res) => {
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
                res.render(`user/student/edit`, {
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
        userModel.update(entity).then(() => res.redirect(`/admin/student`))
            .catch(err => {
                throw err;
            })
    }
})

router.post('/student/delete/:id', authAdmin, (req, res, next) => {
    userModel.delete(req.params.id).then(function (result) {
        res.redirect('/admin/student');
    });
});


module.exports = router;