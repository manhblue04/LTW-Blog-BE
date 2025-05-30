const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");

// Đặt các route login/logout lên trước, không áp dụng middleware
router.post("/admin/login", controller.login);
router.post("/admin/logout", controller.logout);
router.post("/admin/register", controller.register);

// Áp dụng middleware requireLogin cho các route còn lại
const requireLogin = controller.requireLogin;
router.get("/count", requireLogin, controller.count);
router.get("/list", requireLogin, controller.index);
router.get("/:id", requireLogin, controller.detail);


module.exports = router;