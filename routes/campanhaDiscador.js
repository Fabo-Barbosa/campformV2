const express = require("express");
const router = express.Router();
const CampanhaDiscador = require("../classes/CampanhaDiscador");
const slotsCampanha = require("../classes/CampaignSlotManager");
const {
  listarCampanhas,
  criarListasComMailing,
} = require("../services/3cCampanhaService");

router.get("/campanha/nova", async (req, res) => {
  try {
    const campanhas = await listarCampanhas();

    return res.render("campanha/formulariodiscador", {
      context: "disc_form",
      title: "Campanhas",
      campanhas,
      erro: null,
    });
  } catch (error) {
    console.error("[ERRO_LISTAR_CAMPANHAS]", {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });

    return res
      .status(error.statusCode || 500)
      .render("campanha/formulariodiscador", {
        title: "Campanhas",
        campanhas: [],
        erro: error.message || "Erro ao carregar campanhas.",
      });
  }
});

router.post("/campanha/send", async (req, res) => {
  const { name, campaignIds } = req.body;
  const userId = res.locals.user._id;
  var erros = [];
  if (!userId) {
    erros.push({ texto: "Usuário não identificado." });
  }
  if (!name || typeof name === "undefined" || name.length < 3) {
    erros.push({ texto: "O nome da lista é inválido." });
  }
  if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length <= 0) {
    erros.push({ texto: "Deve-se selecionar no mínimo uma campanha." });
  }

  const posicaoSlot = await slotsCampanha.obterPosicaoDoUsuario(
    userId.toString(),
  );
  if (!posicaoSlot) {
    erros.push({
      texto: "O usuário não possui um slot para completar a ação.",
    });
  }
  if (!(posicaoSlot.campanha instanceof CampanhaDiscador)) {
    erros.push({
      texto: "Contextos diferentes. Realize uma nova consulta para normalizar.",
    });
  }

  if (!(posicaoSlot.campanha.quantidadeClientes() > 0)) {
    erros.push({
      texto: "A quantidade de clientes é insuficiente.",
    });
  }

  if (erros.length > 0) {
    try {
      res.locals.success_msg = [];
      const campanhas = await listarCampanhas();

      return res.render("campanha/formulariodiscador", {
        context: "disc_form",
        title: "Campanhas",
        campanhas,
        erros: erros,
      });
    } catch {
      return res
        .status(error.statusCode || 500)
        .render("campanha/formulariodiscador", {
          title: "Campanhas",
          campanhas: [],
          erro: error.message || "Erro ao renderizar página do discador.",
        });
    }
  } else {
    posicaoSlot.campanha.definirCampanhas(campaignIds);
    posicaoSlot.campanha.definirNome(name);
    try {
      const campanhaFinal = await slotsCampanha.enviarCampanha(
        posicaoSlot.chave,
      );
      const resultado = await criarListasComMailing(campanhaFinal);
      req.flash("success_msg", "Listas criadas nas campanhas selecionadas.");
      return res.redirect("/discador/campanha/nova");
    } catch (error) {
      req.flash(
        "error_msg",
        "Falha ao criar listas e adicioná-las nas campanhas.",
      );
      return res.redirect("/discador/campanha/nova");
    }
  }
});

module.exports = router;
