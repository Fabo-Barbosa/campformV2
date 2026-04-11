const express = require("express");
const router = express.Router();

router.get("/nova", (req, res) => {
  res.render("campanha/formulario");
});

router.get("/contas", (req, res) => {
  res.render("campanha/conta");
});

router.get("/fluxos", (req, res) => {
  res.render("campanha/fluxo");
});

module.exports = router;
