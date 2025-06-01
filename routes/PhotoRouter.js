const express = require("express");
const router = express.Router();

const controller = require("../controllers/PhotoController");
const userController = require("../controllers/UserController");

// Áp dụng middleware requireLogin cho tất cả các route
router.get("/photosOfUser/:id", userController.requireLogin, controller.photosOfUser);

// Thêm API bình luận ảnh
router.post("/commentsOfPhoto/:photo_id", userController.requireLogin, controller.addCommentToPhoto);

// Thêm API upload ảnh mới
router.post(
  "/photos/new",
  userController.requireLogin,
  controller.uploadPhotoMiddleware,
  controller.addNewPhoto
);

module.exports = router;
