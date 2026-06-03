// src/services/campanhaEnvio.service.js

const mongoose = require("mongoose");
require("../models/LogCampanha");
const LogCampanha = mongoose.model("log_campanha");
const { enviarContatoParaMtrx } = require("./matrixClient");

const campanhasEmExecucao = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizarListaContatos(body) {
  if (Array.isArray(body.lista_clientes)) return body.lista_clientes;
  return [];
}

function validarCampanha(body) {
  const erros = [];

  if (!body.conta) erros.push({ texto: "cod_conta é obrigatório." });
  if (!body.tipoEnvio) erros.push({ texto: "tipo_envio é obrigatório." });
  if (!body.hsm) erros.push({ texto: "hsm é obrigatório." });

  const tipoEnvio = Number(body.tipoEnvio);

  if (tipoEnvio === 1 && !body.fluxo) {
    erros.push({ texto: "cod_flow é obrigatório quando tipo_envio for 1." });
  }

  const contatos = normalizarListaContatos(body);

  if (!contatos.length) {
    erros.push({ texto: "A campanha precisa ter pelo menos um contato." });
  }

  return erros;
}

function montarPayloadIndividual(campanha, cliente) {
  const tipoEnvio = Number(campanha.tipoEnvio);
  const campoCliente = cliente.toJSON();

  const payload = {
    cod_conta: Number(campanha.conta.cod),
    tipo_envio: tipoEnvio,
    start_flow: 1,
    hsm: Number(campanha.hsm.cod),
    campoCliente,
  };

  if (tipoEnvio === 1) {
    payload.cod_flow = Number(campanha.fluxo.cod);
  }

  if (campanha.forca) {
    payload.bol_incluir_atual = 1;
  }

  return payload;
}

async function registrarSucesso({ logId }) {
  await LogCampanha.findByIdAndUpdate(logId, {
    $inc: {
      sucessos: 1,
    },
    $set: {
      status: "ENVIANDO",
    },
  });
}

async function registrarErro({ logId }) {
  const mensagemErro =
    error.validationErrors?.join(" | ") ||
    error.response?.msg ||
    error.message ||
    "Erro desconhecido no envio.";

  await LogCampanha.findByIdAndUpdate(logId, {
    $inc: {
      erros: 1,
    },
    $set: {
      status: "ENVIANDO",
    },
  });
}

async function cancelarEnvio({ logId }) {
  const chaveExecucao = String(logId);
  if (!campanhasEmExecucao.has(chaveExecucao)) {
    return;
  }
  try {
    await LogCampanha.findByIdAndUpdate(logId, {
      $set: {
        status: "CANCELADO",
        finalizadoEm: new Date(),
      },
    });
  } catch (erro) {
    return {
      ok: false,
      erro: "Falha ao cancelar execução.",
    };
  }

  campanhasEmExecucao.set(chaveExecucao, false);
  return {
    ok: true,
    mensagem: "campanha cancelada com sucesso.",
  };
}

async function executarEnvioCadenciado({
  campanha,
  logId,
  intervaloEntreLotesMs,
  quantidadePorLote,
}) {
  const chaveExecucao = String(logId);

  if (campanhasEmExecucao.has(chaveExecucao)) {
    return;
  }

  campanhasEmExecucao.set(chaveExecucao, true);

  const contatos = normalizarListaContatos(campanha);
  const total = contatos.length;

  try {
    await LogCampanha.findByIdAndUpdate(logId, {
      $set: {
        status: "ENVIANDO",
        total,
        dataEnvio: new Date(),
      },
    });

    for (let index = 0; index < contatos.length; index += quantidadePorLote) {
      const lote = contatos.slice(index, index + quantidadePorLote);
      if (!campanhasEmExecucao.get(chaveExecucao)) {
        return;
      }
      for (const contato of lote) {
        if (!campanhasEmExecucao.get(chaveExecucao)) {
          return;
        }
        try {
          const payloadIndividual = montarPayloadIndividual(campanha, contato);

          await registrarSucesso({
            logId,
          });
        } catch (error) {
          await registrarErro({
            logId,
          });
        }
      }

      const aindaTemMaisLotes = index + quantidadePorLote < contatos.length;

      if (aindaTemMaisLotes) {
        await sleep(intervaloEntreLotesMs);
      }
    }

    const logAtualizado = await LogCampanha.findById(logId);
    await LogCampanha.findByIdAndUpdate(logId, {
      $set: {
        total,
        sucessos: logAtualizado?.sucessos || 0,
        erros: logAtualizado?.erros || 0,
      },
    });
    if (campanhasEmExecucao.get(chaveExecucao)) {
      await LogCampanha.findByIdAndUpdate(logId, {
        $set: {
          status: "FINALIZADO",
          finalizadoEm: new Date(),
        },
      });
    }
  } catch (error) {
    await LogCampanha.findByIdAndUpdate(logId, {
      $set: {
        status: "ABORTADO",
        finalizadoEm: new Date(),
      },
    });
  } finally {
    campanhasEmExecucao.delete(chaveExecucao);
  }
}

async function iniciarCampanhaComCadencia({
  campanha,
  userId,
  intervaloEntreLotesMs = 1500,
  quantidadePorLote = 1,
}) {
  const erros = validarCampanha(campanha);

  if (erros.length > 0) {
    return {
      ok: false,
      validada: false,
      erros,
    };
  }

  const contatos = normalizarListaContatos(campanha);

  const log = await LogCampanha.create({
    conta: campanha.conta._id,
    userId: userId,
    sendType: Number(campanha.tipoEnvio),
    flow: campanha.fluxo ? campanha.fluxo._id : null,
    hsmId: campanha.hsm._id,
    total: contatos.length,
    sucessos: 0,
    erros: 0,
    status: "AGUARDANDO",
  });

  setImmediate(() => {
    executarEnvioCadenciado({
      campanha,
      logId: log._id,
      intervaloEntreLotesMs,
      quantidadePorLote,
    });
  });

  return {
    ok: true,
    validada: true,
    logId: log._id,
    total: contatos.length,
    status: "AGUARDANDO",
    intervaloEntreLotesMs,
    quantidadePorLote,
  };
}

module.exports = {
  iniciarCampanhaComCadencia,
};
