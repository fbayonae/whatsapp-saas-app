const express = require("express");
const router = express.Router();
const logsController = require("../controllers/logsController");
const auth = require("../utils/authMiddleware").auth;

router.get("/",
    auth,
    logsController.getLogs
);

module.exports = router;
