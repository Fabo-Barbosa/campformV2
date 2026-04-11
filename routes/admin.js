const express = require("express");
const router = express.Router();

router.get("/user/list", (req, res) => {
  res.render("admin/userlist");
});

module.exports = router;
