const express = require('express');
const categoryModel = require('../../models/category.model');

let router = express.Router();
let app = express()

router.get('/', async function (req, res) {
    // categoryModel.allParent().then((pC)=>{
    //     let pCat = pC
    //     let pChildCat = []
    //     pCat.forEach(e => {
    //         pChildCat.push(categoryModel.childByParentId(e.id))
    //     });

    //     Promise.all(pChildCat).then((cat)=>{
    //         if(cat){
    //             pCat.map((p, index) => {
    //                 let childs =[]
    //                 cat[index].forEach(e =>{
    //                     if(e.parent_category_id = p.id){
    //                         childs.push(e)
    //                     }
    //                 })
    //                 return p.childs = childs;
    //             })
    //         }
    //         app.locals.cats = pCat
    //         res.render('user/home', {
    //             layout: 'main',                
    //         })
    //     })
    // })
    res.render('user/home', {
        layout: 'main',                
    })
})

module.exports = router;
