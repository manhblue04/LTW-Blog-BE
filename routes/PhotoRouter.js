const express = require("express");
const router = express.Router();
const controller = require("../controllers/PhotoController");

router.get("/photosOfUser/:id", controller.photosOfUser);

module.exports = router;
