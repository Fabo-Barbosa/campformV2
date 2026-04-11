const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/User");
const isAuthenticated = require("../helpers/isAuthenticated");
const UserModel = mongoose.model("user");
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

router.get("/register", (req, res) => {
  res.render("user/register");
});

router.post("/register", (req, res) => {
  var erros = [];

  if (req.body.password.length < 8) {
    erros.push({
      texto: "A senha não possui a quantidade de caracteres apropriada.",
    });
  }

  if (req.body.password != req.body.password2) {
    passport;
    erros.push({ texto: "Senha repetida incorreta." });
  }

  if (erros.length > 0) {
    res.render("user/register", { erros: erros });
  } else {
    UserModel.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          req.flash(
            "error_msg",
            "Já existe uma conta cadastrada com esse email.",
          );
          res.redirect("/user/register");
        } else {
          UserModel.findOne({ username: req.body.username })
            .then((user) => {
              if (user) {
                req.flash(
                  "error_msg",
                  "Já existe uma conta cadastrada com esse email.",
                );
                res.redirect("/user/register");
              } else {
                var eAdmin = 0;
                if (req.body.eAdmin) {
                  eAdmin = 1;
                }
                const newUser = UserModel({
                  name: req.body.name,
                  email: req.body.email,
                  hash: req.body.password,
                  username: req.body.username,
                  eAdmin: eAdmin,
                });

                bcrypt.genSalt(10, (erro, salt) => {
                  bcrypt.hash(newUser.hash, salt, (erro, hash) => {
                    if (erro) {
                      req.flash(
                        "error_msg",
                        "Houve um erro durante o salvamento do usuário.",
                      );
                      res.redirect("/");
                    }

                    newUser.hash = hash;
                    newUser
                      .save()
                      .then(() => {
                        req.flash(
                          "success_msg",
                          "Cadastro realizado com sucesso.",
                        );
                        res.redirect("/");
                      })
                      .catch((err) => {
                        req.flash("error_msg", "Ocorreu um erro interno.");
                        res.redirect("/user/register");
                      });
                  });
                });
              }
            })
            .catch((err) => {
              req.flash("error_msg", "Ocorreu um erro no servidor: ", err);
              res.redirect("/");
            });
        }
      })
      .catch((err) => {
        req.flash("error_msg", "Ocorreu um erro no servidor: ", err);
        res.redirect("/");
      });
  }
});

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
