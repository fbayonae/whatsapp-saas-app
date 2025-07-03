const express = require("express");
const router = express.Router();

// Controllers
const logsController = require("../controllers/logsController");

// Middleware
const auth = require("./middleware/auth").auth;

router.get("/",
    auth,
    logsController.getLogs
);

module.exports = router;
