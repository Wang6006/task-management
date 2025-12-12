const express = require("express");
const router = express.Router();
const efficiencyController = require("../controllers/efficiency.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");

router.route("/").get(efficiencyController.getEfficiency).all(methodNotAllowed);

module.exports = router;
