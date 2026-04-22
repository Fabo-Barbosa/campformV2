const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/User");
const User = mongoose.model("user");
const { eAdmin } = require("../helpers/eAdmin");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/user/list", eAdmin, (req, res) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalUsers = User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    User.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .then((users) => {
        users.forEach((u) => {
          if (u.eAdmin == 1) u.eAdmin = "Sim";
          else u.eAdmin = "Não";

          if (u.active) u.active = "Sim";
          else u.active = "Não";
        });
        res.render("admin/userlist", {
          users: users,
          currentPage: page,
          totalPages: totalPages || 1,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages,
          prevPage: page - 1,
          nextPage: page + 1,
        });
      });
  } catch (error) {
    req.flash("error_msg", "Houve um erro ao listar os usuários");
    res.redirect("/");
  }
});

router.get("/user/register", eAdmin, (req, res) => {
  res.render("admin/register");
});

router.post("/user/register", eAdmin, (req, res) => {
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
    res.render("admin/register", { erros: erros });
  } else {
    User.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          req.flash(
            "error_msg",
            "Já existe uma conta cadastrada com esse email.",
          );
          res.redirect("/user/register");
        } else {
          User.findOne({ username: req.body.username })
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
                const newUser = User({
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
                      res.redirect("/homepage");
                    }

                    newUser.hash = hash;
                    newUser
                      .save()
                      .then(() => {
                        req.flash(
                          "success_msg",
                          "Cadastro realizado com sucesso.",
                        );
                        res.redirect("/admin/user/register");
                      })
                      .catch((err) => {
                        req.flash("error_msg", "Ocorreu um erro interno.");
                        res.redirect("/admin/user/register");
                      });
                  });
                });
              }
            })
            .catch((err) => {
              req.flash("error_msg", "Ocorreu um erro no servidor: ", err);
              res.redirect("/homepage");
            });
        }
      })
      .catch((err) => {
        req.flash("error_msg", "Ocorreu um erro no servidor: ", err);
        res.redirect("/homepage");
      });
  }
});

router.get("/user/edit/:id", eAdmin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .lean()
    .then((_user) => {
      res.render("admin/edituser", { _user: _user });
    })
    .catch((err) => {
      req.flash("error_msg", "Usuário não encontrado.");
      res.redirect("/admin/user/list");
    });
});

router.post("/user/edit", eAdmin, (req, res) => {
  User.findOne({ _id: req.body.id })
    .then((_user) => {
      if (req.body.editpassword || req.body.editpassword.trim() !== "") {
        var erros = [];
        if (req.body.editpassword.length < 8) {
          erros.push({
            texto: "A senha não possui a quantidade de caracteres apropriada.",
          });
        }

        if (erros.length > 0) {
          res.render("admin/edituser", {
            _user: _user.toObject(),
            erros: erros,
          });
        } else {
          _user.hash = req.body.editpassword;
          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(_user.hash, salt, (erro, hash) => {
              if (erro) {
                req.flash(
                  "error_msg",
                  "Houve um erro durante a edição do usuário.",
                );
                res.redirect(`/admin/user/edit/${req.body.id}`);
              }

              _user.hash = hash;
              _user.name = req.body.name;
              _user.email = req.body.email;

              if (req.body.eAdmin) {
                _user.eAdmin = 1;
              }
              _user
                .save()
                .then(() => {
                  req.flash("success_msg", "Usuário editado com sucesso.");
                  res.redirect("/admin/user/list");
                })
                .catch((err) => {
                  req.flash(
                    "error_msg",
                    "Ocorreu um erro ao tentar editar o usuário.",
                  );
                  res.redirect("/admin/user/list");
                });
            });
          });
        }
      } else {
        _user.name = req.body.name;
        _user.email = req.body.email;

        if (req.body.eAdmin) {
          _user.eAdmin = 1;
        }

        _user
          .save()
          .then(() => {
            req.flash("success_msg", "Usuário editado com sucesso.");
            res.redirect("/admin/user/list");
          })
          .catch((err) => {
            req.flash(
              "error_msg",
              "Ocorreu um erro ao tentar editar o usuário.",
            );
            res.redirect("/admin/user/list");
          });
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Ocorreu um erro no servidor.");
      res.redirect("/admin/user/list");
    });
});

module.exports = router;
