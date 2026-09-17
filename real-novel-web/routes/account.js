// routes/account.js
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Book = require("../models/Books");

const router = express.Router();

// GET /account
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      req.session.destroy(() => res.redirect("/login"));
      return;
    }
    const books = await Book.find().select("category -_id").lean();
    const categories = [...new Set(books.map(b => b.category).filter(Boolean))];

    res.render("account", {
      title: "บัญชีของฉัน",
      categories: categories.slice(0, 10),
      user: req.session.user,
      coins: user.coins,
      joinedAt: user.createdAt
    });
  } catch (err) {
    console.error("[GET /account]", err);
    res.status(500).send("เกิดข้อผิดพลาด");
  }
});

// POST /account/update-profile
router.post("/update-profile", async (req, res) => {
  try {
    const { username, email } = (req.body || {});
    const userId = req.session.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "ไม่พบผู้ใช้" });

    if (username && username.trim() && username.trim() !== user.username) {
      const dupe = await User.findOne({ username: username.trim() }).lean();
      if (dupe && dupe._id.toString() !== userId.toString()) {
        return res.status(400).json({ msg: "Username นี้ถูกใช้แล้ว" });
      }
      user.username = username.trim();
    }

    if (email && email.trim() && email.trim().toLowerCase() !== user.email) {
      const dupe = await User.findOne({ email: email.trim().toLowerCase() }).lean();
      if (dupe && dupe._id.toString() !== userId.toString()) {
        return res.status(400).json({ msg: "Email นี้ถูกใช้แล้ว" });
      }
      user.email = email.trim().toLowerCase();
    }

    await user.save();

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };

    res.json({ msg: "บันทึกข้อมูลเรียบร้อย", redirect: "/account" });
  } catch (err) {
    console.error("[POST /account/update-profile]", err);
    res.status(500).json({ msg: "เกิดข้อผิดพลาด" });
  }
});

// POST /account/change-password
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = (req.body || {});
    const userId = req.session.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "ไม่พบผู้ใช้" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ msg: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ msg: "รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: "รหัสผ่านใหม่ไม่ตรงกัน" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "เปลี่ยนรหัสผ่านเรียบร้อย", redirect: "/account" });
  } catch (err) {
    console.error("[POST /account/change-password]", err);
    res.status(500).json({ msg: "เกิดข้อผิดพลาด" });
  }
});

module.exports = router;