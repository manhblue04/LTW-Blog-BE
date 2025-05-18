const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");

router.get("/list", controller.index);

router.get("/:id", controller.detail);

module.exports = router;