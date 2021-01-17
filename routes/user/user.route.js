var express = require("express");
var router = express.Router();
const courseModel = require("../../models/course.model");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("home", {layout:false});
});
router.get("/search", async (req, res, next) => {
  const title = req.params.name;
  console.log(title);
  const list = await courseModel.searchByTitle(title);
  console.log(list);
  res.render('user/search_courses',{
    layout:false,
    courses:list,
    empty: list.length === 0
  })
});

// router.get("/course", authAdmin, (req, res) => {});
// let pageSize = req.query.pageSize;
//   let page = req.query.page - 1;
//   const p = courseModel.bySearch(title, page, pageSize);
//   const numTotal = courseModel.count();
//   Promise.bySearch([title, p, numTotal])
//     .then(function (rows) {
//       let totalPage = Math.ceil(rows[1][0].count / pageSize);
//       rows[0].map((item) => {
//         let newPrice = "";
//         if (item.promo_price != null) {
//           newPrice =
//             StringUtil.formatStringCashNoUnit(item.promo_price) +
//             " (" +
//             StringUtil.formatStringCashNoUnit(item.price) +
//             ")";
//         } else {
//           newPrice = StringUtil.formatStringCashNoUnit(item.price);
//         }
//         item.price = newPrice;
//       });
//       res.render("user/search_courses", {
//         courses: rows[0],
//         empty: rows[0].length === 0,
//         totalPage: Number(totalPage),
//         currentPage: Number(page) + 1,
//         nextPage:
//           Number(page) + 2 > Number(totalPage)
//             ? Number(totalPage)
//             : Number(page) + 2,
//         prevPage: Number(page) <= 0 ? Number(page) + 1 : Number(page),
//       });
//     })
//     .catch(function (err) {
//       console.error(err);
//       res.send("View error log at server console.");
//     });

module.exports = router;
