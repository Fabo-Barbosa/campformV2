const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/User");
const User = mongoose.model("user");
require("../models/Conta");
const Account = mongoose.model("conta");
require("../models/Fluxo");
const Flow = mongoose.model("fluxo");
const { eAdmin } = require("../helpers/eAdmin");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// ##################### Rotas de Usuários ##############################
router.get("/user/list", eAdmin, async (req, res) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push({
        number: i,
        active: i === page,
      });
    }

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
      totalUsers: totalUsers,
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (error) {
    req.flash("error_msg", "Houve um erro ao listar os usuários");
    res.redirect("/homepage");
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
            "Já existe uma conta cadastrada com esse username.",
          );
          res.redirect("/user/register");
        } else {
          User.findOne({ email: req.body.email })
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
              _user.ativo = req.body.ativo == "true" ? true : false;
              _user.eAdmin = req.body.eAdmin || 0;

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
        _user.active = req.body.ativo == "true";
        _user.eAdmin = req.body.eAdmin || 0;

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

router.post("/user/delete/:id", eAdmin, (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Usuário deletado com sucesso.");
      res.redirect("/admin/user/list");
    })
    .catch((err) => {
      req.flash("error_msg", "Falha ao deletar usuário.");
      res.redirect("/admin/user/list");
    });
});

// ##################### Rotas de Contas ##############################
router.get("/account/list", eAdmin, async (req, res) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalAccounts = await Account.countDocuments();
    const totalPages = Math.ceil(totalAccounts / limit);

    const accounts = await Account.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push({
        number: i,
        active: i === page,
      });
    }

    res.render("admin/accountlist", {
      accounts: accounts,
      currentPage: page,
      totalPages: totalPages || 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (error) {
    req.flash("error_msg", "Houve um erro ao listar as contas");
    res.redirect("/homepage");
  }
});

router.get("/account/register", eAdmin, (req, res) => {
  res.render("admin/registeraccount");
});

router.post("/account/register", eAdmin, (req, res) => {
  const erros = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  )
    erros.push({ texto: "Nome inválido!" });
  if (
    !req.body.description ||
    typeof req.body.description == undefined ||
    req.body.description == null
  )
    erros.push({ texto: "Descrição inválida!" });

  if (erros.length > 0) res.render("admin/registeraccount", { erros: erros });
  else {
    Account.findOne({ cod: req.body.cod })
      .lean()
      .then((account) => {
        if (account) {
          req.flash(
            "error_msg",
            "Já existe uma conta cadastrada com esse código matrix.",
          );
          res.redirect("/admin/account/register");
        } else {
          const newAccount = {
            cod: req.body.cod,
            name: req.body.name,
            description: req.body.description,
          };

          new Account(newAccount)
            .save()
            .then(() => {
              req.flash("success_msg", "Conta adicionada com sucesso!");
              res.redirect("/admin/account/list");
            })
            .catch((err) => {
              req.flash(
                "error_msg",
                "Ocorreu um erro ao cadastrar a conta, tente novamente mais tarde.",
              );
              res.redirect("/admin/account/list");
            });
        }
      });
  }
});

router.get("/account/edit/:id", eAdmin, (req, res) => {
  Account.findOne({ _id: req.params.id })
    .lean()
    .then((account) => {
      res.render("admin/editaccount", { account: account });
    })
    .catch((err) => {
      req.flash("error_msg", "Conta não encontrada.");
      res.redirect("/admin/account/list");
    });
});

router.post("/account/edit", eAdmin, (req, res) => {
  Account.findOne({ _id: req.body.id })
    .then((account) => {
      const erros = [];

      if (
        !req.body.name ||
        typeof req.body.name == undefined ||
        req.body.name == null
      )
        erros.push({ texto: "Nome inválido!" });
      if (
        !req.body.description ||
        typeof req.body.description == undefined ||
        req.body.description == null
      )
        erros.push({ texto: "Descrição inválida!" });

      if (erros.length > 0)
        res.render("admin/editaccount", { erros: erros, account: account });
      else {
        account.name = req.body.name;
        account.description = req.body.description;

        account
          .save()
          .then(() => {
            req.flash("success_msg", "Conta editada com sucesso.");
            res.redirect("/admin/account/list");
          })
          .catch((err) => {
            req.flash(
              "error_msg",
              "Ocorreu um erro ao tentar registrar a conta.",
            );
            res.redirect("/admin/account/list");
          });
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Ocorreu um erro no servidor. Tente novamente mais tarde.",
      );
      res.redirect("/admin/account/list");
    });
});

router.post("/account/delete/:id", eAdmin, (req, res) => {
  Account.deleteOne({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Conta deletada com sucesso.");
      res.redirect("/admin/account/list");
    })
    .catch((err) => {
      req.flash("error_msg", "Falha ao deletar conta.");
      res.redirect("/admin/account/list");
    });
});

// ##################### Rotas de Flows ##############################
router.get("/flow/list", eAdmin, async (req, res) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalFlows = await Flow.countDocuments();
    const totalPages = Math.ceil(totalFlows / limit);

    const flows = await Flow.find()
      .populate("conta")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push({
        number: i,
        active: i === page,
      });
    }

    res.render("admin/fluxolist", {
      flows: flows,
      currentPage: page,
      totalPages: totalPages || 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (error) {
    req.flash("error_msg", "Houve um erro ao listar os fluxos do matrix");
    res.redirect("/homepage");
  }
});

router.get("/flow/register", eAdmin, (req, res) => {
  Account.find({})
    .lean()
    .then((accounts) => {
      res.render("admin/registerflow", { contas: accounts });
    })
    .catch((err) => {
      req.flash("error_msg", "Falha em carregar as contas.");
      res.redirect("/admin/account/list");
    });
});

router.post("/flow/register", eAdmin, (req, res) => {
  const erros = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  )
    erros.push({ texto: "Nome inválido!" });
  if (
    !req.body.description ||
    typeof req.body.description == undefined ||
    req.body.description == null
  )
    erros.push({ texto: "Descrição inválida!" });
  if (
    !req.body.conta ||
    typeof req.body.conta == undefined ||
    req.body.conta == ""
  )
    erros.push({ texto: "Conta vazia!" });

  if (erros.length > 0) {
    Account.find({})
      .lean()
      .then((accounts) => {
        res.render("admin/registerflow", { contas: accounts, erros: erros });
      })
      .catch((err) => {
        req.flash("error_msg", "Falha em carregar as contas.");
        res.redirect("/admin/flow/list");
      });
  } else {
    Flow.findOne({ cod: req.body.cod })
      .lean()
      .then((flow) => {
        if (flow) {
          req.flash(
            "error_msg",
            "Já existe um flow cadastrado com esse código matrix.",
          );
          res.redirect("/admin/flow/register");
        } else {
          const newFlow = {
            cod: req.body.cod,
            name: req.body.name,
            description: req.body.description,
            conta: req.body.conta,
          };

          new Flow(newFlow)
            .save()
            .then(() => {
              req.flash("success_msg", "Fluxo adicionado com sucesso!");
              res.redirect("/admin/flow/list");
            })
            .catch((err) => {
              req.flash(
                "error_msg",
                "Ocorreu um erro ao cadastrar o fluxo, tente novamente mais tarde.",
              );
              res.redirect("/admin/flow/list");
            });
        }
      });
  }
});

router.get("/flow/edit/:id", eAdmin, (req, res) => {
  Account.find({})
    .lean()
    .then((accounts) => {
      Flow.findOne({ _id: req.params.id })
        .populate("conta")
        .sort({ createdAt: -1 })
        .lean()
        .then((flow) => {
          accounts = accounts.filter((conta) => conta.cod !== flow.conta.cod);
          res.render("admin/editflow", { flow: flow, contas: accounts });
        })
        .catch((err) => {
          req.flash("error_msg", "Flow não encontrado.");
          res.redirect("/admin/flow/list");
        });
    });
});

router.post("/flow/edit", eAdmin, (req, res) => {
  Flow.findOne({ _id: req.body.id })
    .then((flow) => {
      const erros = [];

      if (
        !req.body.name ||
        typeof req.body.name == undefined ||
        req.body.name == null
      )
        erros.push({ texto: "Nome inválido!" });
      if (
        !req.body.description ||
        typeof req.body.description == undefined ||
        req.body.description == null
      )
        erros.push({ texto: "Descrição inválida!" });
      if (
        !req.body.conta ||
        typeof req.body.conta == undefined ||
        req.body.conta == ""
      )
        erros.push({ texto: "Conta vazia!" });

      if (erros.length > 0)
        Account.find({})
          .sort({ createdAt: -1 })
          .lean()
          .then((accounts) => {
            res.render("admin/editflow", {
              erros: erros,
              flow: flow,
              contas: accounts,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Erro ao tentar carregar as contas.");
            res.redirect("/admin/flow/list");
          });
      else {
        flow.name = req.body.name;
        flow.description = req.body.description;
        flow.conta = req.body.conta;

        flow
          .save()
          .then(() => {
            req.flash("success_msg", "Fluxo editado com sucesso.");
            res.redirect("/admin/flow/list");
          })
          .catch((err) => {
            req.flash(
              "error_msg",
              "Ocorreu um erro ao tentar salvar as alterações do fluxo.",
            );
            res.redirect("/admin/flow/list");
          });
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Ocorreu um erro no servidor. Tente novamente mais tarde.",
      );
      res.redirect("/admin/flow/list");
    });
});

router.post("/flow/delete/:id", eAdmin, (req, res) => {
  Flow.deleteOne({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Fluxo deletado com sucesso.");
      res.redirect("/admin/flow/list");
    })
    .catch((err) => {
      req.flash("error_msg", "Falha ao deletar fluxo.");
      res.redirect("/admin/flow/list");
    });
});

module.exports = router;
