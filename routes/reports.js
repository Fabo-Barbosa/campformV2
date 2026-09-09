const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const HsmClass = require("../classes/HsmClasse");
require("../models/User");
const User = mongoose.model("user");
require("../models/Conta");
const Account = mongoose.model("conta");
require("../models/Hsm");
const Hsm = mongoose.model("hsm");
require("../models/LogCampanha");
const LogCampanha = mongoose.model("log_campanha");

function isObjectIdValido(id) {
  return id && mongoose.Types.ObjectId.isValid(id);
}

function montarFiltroData(dataInicio, dataFim) {
  const filtroData = {};

  if (dataInicio) {
    const inicio = new Date(dataInicio);

    if (!Number.isNaN(inicio.getTime())) {
      filtroData.$gte = inicio;
    }
  }

  if (dataFim) {
    const fim = new Date(dataFim);

    if (!Number.isNaN(fim.getTime())) {
      filtroData.$lte = fim;
    }
  }

  return filtroData;
}

async function montarFiltroLogs(query) {
  const { usuarioId, contaId, categoriaHsmId, dataInicio, dataFim, status } =
    query;

  const filtro = {};

  if (isObjectIdValido(usuarioId)) {
    filtro.userId = new mongoose.Types.ObjectId(usuarioId);
  }

  if (isObjectIdValido(contaId)) {
    filtro.conta = new mongoose.Types.ObjectId(contaId);
  }

  if (status) {
    filtro.status = status;
  }

  const filtroData = montarFiltroData(dataInicio, dataFim);

  if (Object.keys(filtroData).length > 0) {
    filtro.createdAt = filtroData;
  }

  if (categoriaHsmId) {
    const hsmsDaCategoria = await Hsm.find({
      type: categoriaHsmId,
    })
      .select("_id")
      .lean();

    const hsmIds = hsmsDaCategoria.map((hsm) => hsm._id);

    filtro.hsmId = { $in: hsmIds };
  }

  return filtro;
}

function formatarDataBR(data) {
  if (!data) return "";

  const date = new Date(data);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("pt-BR", {
    timeZone: "America/Belem",
  });
}

function escaparCsv(valor) {
  if (valor === null || valor === undefined) return "";

  const texto = String(valor).replace(/"/g, '""');

  if (
    texto.includes(",") ||
    texto.includes(";") ||
    texto.includes("\n") ||
    texto.includes('"')
  ) {
    return `"${texto}"`;
  }

  return texto;
}

/**
 * Tela principal
 * GET /relatorios/analitico
 */
router.get("/analitico", async (req, res, next) => {
  try {
    const [usuarios, contas] = await Promise.all([
      User.find({}).select("_id name email").sort({ name: 1 }).lean(),
      Account.find({}).select("_id name").sort({ name: 1 }).lean(),
    ]);
    const categoriasHsm = HsmClass.CATEGORIES.map((c) => c.name);
    res.render("report/reportsearch", {
      context: "camp_report",
      title: "Relatório Analítico",
      usuarios,
      contas,
      categoriasHsm,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint JSON paginado
 * GET /relatorios/analitico/logs
 */
router.get("/analitico/logs", async (req, res, next) => {
  try {
    const pagina = Math.max(Number(req.query.page) || 1, 1);
    const limite = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (pagina - 1) * limite;

    const filtro = await montarFiltroLogs(req.query);

    const [totalRegistros, registros] = await Promise.all([
      LogCampanha.countDocuments(filtro),
      LogCampanha.find(filtro)
        .select(
          "createdAt finalizadoEm total sucessos erros status userId hsmId",
        )
        .sort({ createdAt: -1 })
        .populate(["userId", "hsmId"])
        .skip(skip)
        .limit(limite)
        .lean(),
    ]);

    const totalPaginas = Math.ceil(totalRegistros / limite);

    res.json({
      page: pagina,
      limit: limite,
      totalRegistros,
      totalPaginas,
      registros: registros.map((log) => ({
        usuario: log.userId.username,
        hsm: log.hsmId.cod,
        createdAt: log.createdAt,
        finalizadoEm: log.finalizadoEm,
        total: log.total || 0,
        sucessos: log.sucessos || 0,
        erros: log.erros || 0,
        status: log.status || "",
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint CSV sem paginação
 * GET /relatorios/analitico/logs/csv
 */
router.get("/analitico/logs/csv", async (req, res, next) => {
  try {
    const filtro = await montarFiltroLogs(req.query);

    const logs = await LogCampanha.find(filtro)
      .select("createdAt finalizadoEm total sucessos erros status hsmId userId")
      .sort({ createdAt: -1 })
      .populate(["hsmId", "userId"])
      .lean();

    const cabecalho = [
      "Hsm",
      "Usuario",
      "Criado em",
      "Finalizado em",
      "Total",
      "Sucessos",
      "Erros",
      "Status",
    ];

    const linhas = logs.map((log) => [
      log.userId.username,
      log.hsmId.cod,
      formatarDataBR(log.createdAt),
      formatarDataBR(log.finalizadoEm),
      log.total || 0,
      log.sucessos || 0,
      log.erros || 0,
      log.status || "",
    ]);

    const csv = [
      cabecalho.map(escaparCsv).join(";"),
      ...linhas.map((linha) => linha.map(escaparCsv).join(";")),
    ].join("\n");

    const nomeArquivo = `relatorio-analitico-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nomeArquivo}"`,
    );

    /*
      BOM UTF-8 para abrir corretamente no Excel.
    */
    res.send(`\uFEFF${csv}`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
