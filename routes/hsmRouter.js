const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Hsm");
const Hsm = mongoose.model("hsm");
require("../models/Conta");
const Account = mongoose.model("conta");
require("../models/LogCampanha");
const LogCampanha = mongoose.model("log_campanha");
const HsmClasse = require("../classes/HsmClasse");

// Rotas para hsms
router.get("/hsm/list", async (req, res) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalHsms = await Hsm.countDocuments();
    const totalPages = Math.ceil(totalHsms / limit);

    const hsms = await Hsm.find()
      .populate("conta")
      .sort({ _id: -1, createdAt: -1 })
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

    res.render("campanha/hsmlist", {
      hsms: hsms,
      currentPage: page,
      totalPages: totalPages || 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (error) {
    req.flash("error_msg", "Houve um erro ao listar os hsms do matrix");
    res.redirect("/homepage");
  }
});

router.get("/hsm/register", (req, res) => {
  Account.find({})
    .lean()
    .then((accounts) => {
      res.render("campanha/registerhsm", {
        context: "hsm_register",
        contas: accounts,
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Falha em carregar as contas.");
      res.redirect("/template/hsm/list");
    });
});

router.post("/hsm/register", (req, res) => {
  const erros = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  )
    erros.push({ texto: "Nome inválido!" });
  if (
    !req.body.content ||
    typeof req.body.content == undefined ||
    req.body.content == null
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
        res.render("admin/registerhsm", { contas: accounts, erros: erros });
      })
      .catch((err) => {
        req.flash("error_msg", "Falha em carregar as contas.");
        res.redirect("/admin/hsm/list");
      });
  } else {
    Hsm.findOne({ cod: req.body.cod })
      .lean()
      .then((hsm) => {
        if (hsm) {
          req.flash(
            "error_msg",
            "Já existe um hsm cadastrado com esse código matrix.",
          );
          res.redirect("/template/hsm/register");
        } else {
          var variaveis = {};

          if (req.body.variaveis) {
            req.body.variaveis.forEach((v) => {
              variaveis[v.token] = v.campo;
            }); 
          }
          const newHsm = {
            cod: req.body.cod,
            name: req.body.name,
            content: req.body.content,
            conta: req.body.conta,
            type: req.body.type,
            variables: variaveis,
          };

          new Hsm(newHsm)
            .save()
            .then(() => {
              req.flash("success_msg", "Hsm adicionado com sucesso!");
              res.redirect("/template/hsm/list");
            })
            .catch((err) => {
              req.flash(
                "error_msg",
                "Ocorreu um erro ao cadastrar o hsm, tente novamente mais tarde.",
              );
              res.redirect("/template/hsm/list");
            });
        }
      });
  }
});

router.get("/hsm/edit/:id", (req, res) => {
  Account.find({})
    .lean()
    .then((accounts) => {
      Hsm.findOne({ _id: req.params.id })
        .populate("conta")
        .lean()
        .then((hsm) => {
          accounts = accounts.filter((conta) => conta.cod !== hsm.conta.cod);
          res.render("campanha/edithsm", {
            context: "hsm_edit",
            hsm: hsm,
            contas: accounts,
          });
        })
        .catch((err) => {
          req.flash("error_msg", "Hsm não encontrado.");
          res.redirect("/template/hsm/list");
        });
    });
});

router.post("/hsm/edit", (req, res) => {
  Hsm.findOne({ _id: req.body.id })
    .populate("conta")
    .then((hsm) => {
      const erros = [];

      if (
        !req.body.name ||
        typeof req.body.name == undefined ||
        req.body.name == null
      )
        erros.push({ texto: "Nome inválido!" });
      if (
        !req.body.conta ||
        typeof req.body.conta == undefined ||
        req.body.conta == ""
      )
        erros.push({ texto: "Conta vazia!" });

      if (erros.length > 0) {
        Account.find({})
          .sort({ createdAt: -1 })
          .lean()
          .then((accounts) => {
            accounts = accounts.filter((conta) => conta.cod !== hsm.conta.cod);
            res.render("campanha/edithsm", {
              erros: erros,
              hsm: hsm.toObject(),
              contas: accounts,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Erro ao tentar carregar as contas.");
            res.redirect("/template/hsm/list");
          });
      } else {
        hsm.name = req.body.name;
        hsm.type = req.body.type;
        hsm.conta = req.body.conta;

        var variaveis = {};

        if (req.body.variaveis)
          req.body.variaveis.forEach((v) => {
            variaveis[v.token] = v.campo;
          });

        hsm.variables = variaveis;

        hsm
          .save()
          .then(() => {
            req.flash("success_msg", "Hsm editado com sucesso.");
            res.redirect("/template/hsm/list");
          })
          .catch((err) => {
            req.flash(
              "error_msg",
              "Ocorreu um erro ao tentar salvar as alterações do hsm.",
            );
            res.redirect("/template/hsm/list");
          });
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Ocorreu um erro no servidor. Tente novamente mais tarde: " + err,
      );
      res.redirect("/template/hsm/list");
    });
});

router.post("/hsm/delete/:id", (req, res) => {
  LogCampanha.findOne({ hsmId: req.params.id })
    .then((log) => {
      if (log) {
        req.flash(
          "error_msg",
          "O hsm já está vinculado a uma campanha. Não é possível excluí-lo",
        );
        res.redirect("/template/hsm/list");
      } else {
        Hsm.deleteOne({ _id: req.params.id })
          .then(() => {
            req.flash("success_msg", "Hsm deletado com sucesso.");
            res.redirect("/template/hsm/list");
          })
          .catch((err) => {
            req.flash("error_msg", "Falha ao deletar o hsm.");
            res.redirect("/template/hsm/list");
          });
      }
    })
    .catch((error) => {
      req.flash("error_msg", "Falha ao deletar o hsm.");
      res.redirect("/template/hsm/list");
    });
});

router.get("/hsms/:id", async (req, res) => {
  try {
    const hsms = await Hsm.find({ conta: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: hsms,
    });
  } catch (error) {
    console.error("Erro na rota /template/hsms:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao consultar hsms da conta",
    });
  }
});

router.get("/hsm/variables", async (req, res) => {
  try {
    const hsmFields = HsmClasse.VARIABLE_FIELDS;

    return res.json({
      success: true,
      data: hsmFields,
    });
  } catch (error) {
    console.error("Erro na rota /template/hsm/variables:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao consultar campos de veriaveis de hsm",
    });
  }
});

router.get("/hsm/:id", async (req, res) => {
  try {
    const hsm = await Hsm.findOne({ _id: req.params.id }).lean();

    return res.json({
      success: true,
      data: hsm,
    });
  } catch (error) {
    console.error("Erro na rota /template/hsm:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao consultar hsm",
    });
  }
});

router.post("/hsm/price", async (req, res) => {
  try {
    if (req.params.count !== 0) {
      const hsm = await Hsm.findOne({ _id: req.body.hsm_id }).lean();
      const category = HsmClasse.CATEGORIES.find(
        (cat) => cat.name === hsm.type,
      );
      const price = category.price * parseInt(req.body.quantidade);

      return res.json({
        success: true,
        value: price,
      });
    } else {
      return res.json({
        success: true,
        value: 0.0,
      });
    }
  } catch (error) {
    console.error("Erro na rota price/count/hsm", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao consultar valor total: " + error,
    });
  }
});

module.exports = router;
