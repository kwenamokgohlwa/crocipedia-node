const express = require("express");
const router = express.Router();

router.get("/", staticController.index);

module.exports = router;
