const express = require("express");
const router = express.Router();
const HsmClasse = require("../classes/HsmClasse");
const CampanhaMatrix = require("../classes/CampanhaMatrix");
const slotsCampanha = require("../classes/CampaignSlotManager");
const Cliente = require("../classes/Cliente");
const mongoose = require("mongoose");
require("../models/Conta");
const Account = mongoose.model("conta");
require("../models/Hsm");
const Hsm = mongoose.model("hsm");
require("../models/Fluxo");
const Flow = mongoose.model("fluxo");
require("../models/LogCampanha");
const LogCampanha = mongoose.model("log_campanha");
const { consultarResumoCampanha } = require("../services/querieRbxServices");
const {
  iniciarCampanhaComCadencia,
  cancelarEnvio,
} = require("../services/matrixCampanhaService");
const {
  recuperarAgendamentosPendentes,
  agendarCampanhaComCadencia,
  cancelarAgendamentoCampanha,
} = require("../services/matrixCampanhaAgendamentoService");

recuperarAgendamentosPendentes({
  intervaloEntreLotesMs: 2000,
  quantidadePorLote: 20,
})
  .then((resultado) => {
    console.log(`Agendamentos recuperados: ${resultado.totalRecuperados}`);
  })
  .catch((error) => {
    console.error("Erro ao recuperar agendamentos pendentes:", error);
  });

// Funções utilitárias
function formatarData(data) {
  if (!data) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(data));
}

function normalizarBoolean(value) {
  return (
    value === true ||
    value === "true" ||
    value === "on" ||
    value === 1 ||
    value === "1"
  );
}

function parseAgendamentos(agendamentos) {
  if (!agendamentos) {
    return [];
  }

  if (Array.isArray(agendamentos)) {
    return agendamentos.filter(Boolean).map((valor) => new Date(valor));
  }

  if (typeof agendamentos === "object") {
    return Object.keys(agendamentos)
      .sort((a, b) => Number(a) - Number(b))
      .map((chave) => agendamentos[chave])
      .filter(Boolean)
      .map((valor) => new Date(valor));
  }

  return [new Date(agendamentos)];
}

function validarObjectId(value) {
  return value && mongoose.Types.ObjectId.isValid(String(value));
}

// Formulário princiapl
router.get("/campanha/nova", (req, res) => {
  Account.find()
    .sort({ createdAt: -1 })
    .lean()
    .then((contas) => {
      Flow.find()
        .sort({ createdAt: -1 })
        .lean()
        .then((fluxos) => {
          res.render("campanha/formulariohsm", {
            context: "send_form",
            contas: contas,
            fluxos: fluxos,
            sendtypes: CampanhaMatrix.TYPE,
          });
        })
        .catch((err) => {
          req.flash("error_msg", "Falha ao carregar fluxos.");
          res.redirect("/homepage");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Falha ao carregar contas.");
      res.redirect("/homepage");
    });
});

// Rotas de log de campanha
router.post("/log/cancel/:id", async (req, res) => {
  const campanhaEmExecId = req.params.id;
  try {
    const log = await LogCampanha.findById(campanhaEmExecId).lean();

    if (log) {
      if (log.grupoAgendamento && log.status === "AGUARDANDO") {
        const respCancelAgendamento =
          await cancelarAgendamentoCampanha(campanhaEmExecId);

        if (respCancelAgendamento.ok) {
          req.flash(
            "success_msg",
            "Agendamento de campanha cancelado com sucesso.",
          );
          res.redirect("/mensagem-hsm/log/list");
        } else {
          req.flash(
            "error_msg",
            "O estado atual da campanha não permite o seu cancelamento",
          );
          res.redirect("/mensagem-hsm/log/list");
        }
      } else {
        const respCancel = await cancelarEnvio({ logId: campanhaEmExecId });
        if (respCancel.ok) {
          req.flash("success_msg", "Envio de campanha cancelado com sucesso.");
          res.redirect("/mensagem-hsm/log/list");
        } else {
          req.flash(
            "error_msg",
            "O estado atual da campanha não permite o seu cancelamento",
          );
          res.redirect("/mensagem-hsm/log/list");
        }
      }
    } else {
      req.flash(
        "error_msg",
        "O registro de log da campanha não foi encontrado",
      );
      res.redirect("/campanha/log/list");
    }
  } catch (error) {
    req.flash(
      "error_msg",
      "Ocorreu um erro no servidor ao tentar cancelar a campanha",
    );
    res.redirect("/campanha/log/list");
  }
});

router.get("/log/info/:id", async (req, res) => {
  const campanhaLogId = req.params.id;
  try {
    const campanhaLog = await LogCampanha.findById(campanhaLogId)
      .populate(["hsmId", "userId", "flow", "conta"])
      .lean();

    if (campanhaLog) {
      res.render("campanha/infocampanhalog", { log: campanhaLog });
    } else {
      req.flash(
        "error_msg",
        "O log da campanha não foi encontrado na base da dados.",
      );
      res.redirect("/mensagem-hsm/log/list");
    }
  } catch (error) {
    req.flash(
      "error_msg",
      "Ocorreu um erro ao buscar informações do log na base.",
    );
    res.redirect("/mensagem-hsm/log/list");
  }
});

router.get("/log/list", async (req, res) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalLogs = await LogCampanha.countDocuments();
    const totalPages = Math.ceil(totalLogs / limit);

    const logs = await LogCampanha.find()
      .sort({ createdAt: -1, _id: -1 })
      .populate(["hsmId", "userId"])
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

    res.render("campanha/logcampanhalist", {
      context: "logs_list",
      logs: logs,
      currentPage: page,
      totalPages: totalPages || 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (error) {
    req.flash(
      "error_msg",
      "Houve um erro ao listar os logs de campanha " + error,
    );
    res.redirect("/homepage");
  }
});

router.post("/campanha/send", async (req, res) => {
  const {
    sendtype,
    conta,
    fluxoMatrix,
    hsm,
    divisoesAgendamentos = 0,
    agendamentos,
    forca,
  } = req.body || {};
  const userId = res.locals.user._id;
  const sendtypeNumber = Number(sendtype);
  const divisoesNumber = Number(divisoesAgendamentos || 0);
  const forcarEnvio = normalizarBoolean(forca);
  var erros = [];
  if (!userId) {
    erros.push({ texto: "Usuário não identificado." });
  }
  if (![1, 2].includes(sendtypeNumber)) {
    erros.push({ texto: "Tipo de envio inválido. Use 1 ou 2." });
  }
  if (!validarObjectId(conta)) {
    erros.push({ texto: "Conta inválida!" });
  }
  if (!validarObjectId(hsm)) {
    erros.push({ texto: "Hsm inválido!" });
  }
  if (sendtypeNumber !== 2 && !validarObjectId(fluxoMatrix)) {
    erros.push({ texto: "Fluxo inválido!" });
  }
  if (Number.isNaN(divisoesNumber) || divisoesNumber < 0) {
    erros.push({ texto: "Número de agendamentos inválido!" });
  }

  const datasAgendamento = parseAgendamentos(agendamentos);
  if (divisoesNumber > 0) {
    if (!datasAgendamento.length) {
      erros.push({ texto: "Datas de agendamento vazias!" });
    }

    const algumaDataInvalida = datasAgendamento.some((data) =>
      Number.isNaN(data.getTime()),
    );

    if (algumaDataInvalida) {
      erros.push({ texto: "Existem uma ou mais datas inválidas!" });
    }

    if (datasAgendamento.length !== divisoesNumber) {
      erros.push({
        texto: "Número de agendamentos e número de datas não condizem!",
      });
    }
  }

  const [contaDoc, hsmDoc, fluxoDoc] = await Promise.all([
    Account.findOne({ _id: conta }).lean(),
    Hsm.findOne({ _id: hsm }).lean(),
    sendtypeNumber === 2
      ? Promise.resolve(null)
      : Flow.findOne({ _id: fluxoMatrix }).lean(),
  ]);

  if (!contaDoc || typeof contaDoc === "undefined") {
    erros.push({ texto: "Conta não encontrada!" });
  }

  if (!hsmDoc) {
    erros.push({ texto: "Hsm não encontrado." });
  }

  if (sendtypeNumber !== 2 && !fluxoDoc) {
    erros.push({ texto: "Fluxo não encontrado." });
  }

  const posicaoSlot = await slotsCampanha.obterPosicaoDoUsuario(
    userId.toString(),
  );

  if (!posicaoSlot) {
    erros.push({
      texto: "Usuário não possui um slot para realizar essa ação.",
    });
  }

  if (!(posicaoSlot.campanha instanceof CampanhaMatrix)) {
    erros.push({
      texto: "Contextos diferentes. Realize uma nova consulta para normalizar.",
    });
  }

  const contas = await Account.find().sort({ createdAt: -1 }).lean();

  if (erros.length > 0) {
    res.locals.success_msg = [];

    res.render("campanha/formulariohsm", {
      context: "send_form",
      contas: contas,
      sendtypes: CampanhaMatrix.TYPE,
      erros: erros,
    });
  } else {
    posicaoSlot.campanha.definirConta(contaDoc);
    posicaoSlot.campanha.definirFluxo(fluxoDoc);
    posicaoSlot.campanha.definirTipoDeEnvio(sendtypeNumber);
    posicaoSlot.campanha.definirHsm(hsmDoc);
    if (forca) posicaoSlot.campanha.forcarEnvio();

    const campanhaFinal = await slotsCampanha.enviarCampanha(posicaoSlot.chave);

    if (divisoesNumber === 0) {
      const resultadoEnvio = await iniciarCampanhaComCadencia({
        campanha: campanhaFinal,
        userId: userId,
      });

      if (resultadoEnvio.ok) {
        req.flash("success_msg", "Campanha enviada imediatamente com sucesso!");
        return res.redirect("/mensagem-hsm/campanha/nova");
      } else {
        res.locals.seccess_msg = [];
        res.render("campanha/formulariohsm", {
          contas: contas,
          sendtypes: CampanhaMatrix.TYPE,
          erros: resultadoEnvio.erros,
        });
      }
    } else {
      const resultadoAgendamento = await agendarCampanhaComCadencia({
        campanha: campanhaFinal,
        userId,
        agendamentos: datasAgendamento,
        intervaloEntreLotesMs: 2000,
        quantidadePorLote: 20,
      });

      if (resultadoAgendamento.ok) {
        req.flash(
          "success_msg",
          `Campanha agendada com sucesso! ${resultadoAgendamento.totalClientes} clientes divididos em ${resultadoAgendamento.totalAgendamentos} agendamento(s).`,
        );

        return res.redirect("/mensagem-hsm/campanha/nova");
      }

      res.locals.success_msg = [];

      return res.render("campanha/formulariohsm", {
        context: "send_form",
        contas,
        sendtypes: CampanhaMatrix.TYPE,
        erros: resultadoAgendamento.erros,
      });
    }
  }
});

router.get("/fluxos/:id", async (req, res) => {
  try {
    const flows = await Flow.find({ conta: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: flows,
    });
  } catch (error) {
    console.error("Erro na rota /campanha/fluxos:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao consultar fluxos da conta",
    });
  }
});

router.get("/count/:slot", async (req, res) => {
  try {
    const campaign = slotsCampanha.obterCampanha(req.params.slot);
    const count = campaign.quantidadeClientes();

    return res.json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error("Erro na rota /count/campaign", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao consultar quantidade de clientes",
    });
  }
});



router.post("/log/api/refresh", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({
        success: false,
        message: "Nenhum ID de log foi informado.",
      });
    }

    const logs = await LogCampanha.find({
      _id: { $in: ids },
    })
      .populate(["hsmId", "userId"])
      .lean();

    const logsMapeados = logs.map((log) => ({
      _id: String(log._id),
      hsm: log.hsmId,
      dataInicio: formatarData(log.createdAt),
      dataFinal: formatarData(log.finalizadoEm),
      total: log.total ?? 0,
      sucessos: log.sucessos ?? 0,
      erros: log.erros ?? 0,
      usuario: log.userId.username ?? "-",
      status: log.status ?? "-",
    }));

    return res.json({
      success: true,
      logs: logsMapeados,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erro interno ao atualizar logs.",
    });
  }
});

module.exports = router;
