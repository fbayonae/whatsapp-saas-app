const express = require("express");
const controller = require("./controllers/tenantController");
const router = express.Router();

router.get("/", controller.getAllTenants);
router.get("/:id", controller.getTenantById);
router.post("/", controller.createTenant);
router.put("/:id", controller.updateTenant);
router.delete("/:id", controller.deleteTenant);

module.exports = router;

