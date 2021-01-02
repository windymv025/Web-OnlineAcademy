const express = require('express');
const categoryModel = require('../../models/category.model');

const router = express.Router();

router.get('/', async function (req, res) {
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

router.get('/:id', async function (req, res) {
	const id = req.params.id;
	const category = await categoryModel.single(id);
	if (category === null) {
		return res.redirect('/admin/categories');
	}

	res.render('categories/edit', {
		category
	});
})

router.use('/add', function (req, res) {
	res.render('category/add');
})

router.post('/add', async function (req, res) {
	const ret = await categoryModel.add(req.body);
	// console.log(ret);
	// res.send('OK');
	res.render('categories/add');
})

router.post('/del', async function (req, res) {
	const ret = await categoryModel.del(req.body);
	res.redirect('/admin/categories');
})

router.post('/patch', async function (req, res) {
	const ret = await categoryModel.patch(req.body);
	res.redirect('/admin/categories');
})

module.exports = router;