const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../utils/authMiddleware").auth;
//const validate = require("../utils/validators");

router.get("/",
    auth,
    userController.getAllUsers
);

module.exports = router;