const express = require("express");
const router = express.Router();
const isAuthenticated = require("../helpers/isAuthenticated");
const mongoose = require("mongoose");
require("../models/User");
const User = mongoose.model("user");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/login", (req, res) => {
  res.render("user/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/homepage",
    failureRedirect: "/user/login",
    failureFlash: true,
  })(req, res, next);
});

router.use(isAuthenticated);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "Deslogado");
    req.session.destroy();
    res.redirect("/");
  });
});

module.exports = router;
