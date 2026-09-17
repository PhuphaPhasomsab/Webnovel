const express = require('express');
const router = express.Router();

router.get("/works", (req, res) => {
    const totalEp = 0;
    res.render("add", { 
        title: "งานเขียนของฉัน",
        totalEp});
});

router.post("/works", (req, res) => {
    const { count } = req.body;
    // console.log("จำนวนตอน:", count);
    // ส่งข้อมูล JSON 
    res.json({ totalEp: count });
});

module.exports = router;