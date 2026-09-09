const mongoose = require("mongoose");

const LogCampanha = mongoose.model("log_campanha");

const {
  executarEnvioCadenciado,
  normalizarListaContatos,
} = require("./matrixCampanhaService");

const timersAgendamentos = new Map();
const MAX_TIMEOUT_MS = 2147483647;

function obterId(valor) {
  if (!valor) return null;

  if (valor._id) return valor._id;

  return valor;
}

function obterHsmId(campanha) {
  return obterId(campanha.hsmId || campanha.hsm);
}

function obterContaId(campanha) {
  return obterId(campanha.contaId || campanha.conta);
}

function obterFlowId(campanha) {
  return obterId(campanha.flow || campanha.fluxo || campanha.fluxoMatrix);
}

function obterSendType(campanha) {
  return Number(campanha.sendType || campanha.tipoEnvio);
}

function obterForcaEnvio(campanha) {
  return Boolean(campanha.forcaEnvio || campanha.forca);
}

function validarDatasAgendamento(agendamentos) {
  const erros = [];

  if (!Array.isArray(agendamentos) || agendamentos.length === 0) {
    erros.push({ texto: "Informe pelo menos uma data de agendamento." });
    return erros;
  }

  if (agendamentos.length > 3) {
    erros.push({ texto: "É permitido agendar no máximo 3 disparos." });
  }

  const agora = new Date();

  for (const data of agendamentos) {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      erros.push({ texto: "Existe uma data de agendamento inválida." });
      continue;
    }

    if (data <= agora) {
      erros.push({
        texto: "As datas de agendamento precisam ser futuras.",
      });
    }
  }

  return erros;
}

function dividirContatosPorAgendamento(contatos, totalAgendamentos) {
  const grupos = [];

  const totalContatos = contatos.length;
  const base = Math.floor(totalContatos / totalAgendamentos);
  const resto = totalContatos % totalAgendamentos;

  let inicio = 0;

  for (let i = 0; i < totalAgendamentos; i++) {
    const tamanhoDoGrupo = base + (i < resto ? 1 : 0);
    const fim = inicio + tamanhoDoGrupo;

    grupos.push(contatos.slice(inicio, fim));

    inicio = fim;
  }

  return grupos;
}

function montarCampanhaParcial(campanha, contatosDoAgendamento) {
  const campanhaParcial = {
    ...campanha,
    lista_clientes: contatosDoAgendamento,
  };

  /**
   * Caso em algum ponto do seu projeto a lista venha com outro nome,
   * isso ajuda a manter compatibilidade.
   */
  if (Array.isArray(campanha.clientes)) {
    campanhaParcial.clientes = contatosDoAgendamento;
  }

  if (Array.isArray(campanha.contatos)) {
    campanhaParcial.contatos = contatosDoAgendamento;
  }

  return campanhaParcial;
}

function limparTimerAgendamento(logId) {
  const chave = String(logId);

  if (timersAgendamentos.has(chave)) {
    clearTimeout(timersAgendamentos.get(chave));
    timersAgendamentos.delete(chave);
  }
}

function agendarExecucaoDoLog({
  logId,
  campanha,
  dataAgendada,
  intervaloEntreLotesMs,
  quantidadePorLote,
}) {
  const chave = String(logId);

  limparTimerAgendamento(chave);

  const atrasoMs = dataAgendada.getTime() - Date.now();

  /**
   * Se a data estiver muito distante, o setTimeout pode estourar o limite.
   * Então reagendamos em blocos até chegar perto da execução real.
   */
  const atrasoSeguro = Math.max(0, Math.min(atrasoMs, MAX_TIMEOUT_MS));

  const timer = setTimeout(async () => {
    try {
      timersAgendamentos.delete(chave);

      if (atrasoMs > MAX_TIMEOUT_MS) {
        agendarExecucaoDoLog({
          logId,
          campanha,
          dataAgendada,
          intervaloEntreLotesMs,
          quantidadePorLote,
        });

        return;
      }

      const logAtual = await LogCampanha.findById(logId).lean();

      if (!logAtual) {
        return;
      }

      if (logAtual.status !== "AGUARDANDO") {
        return;
      }

      await executarEnvioCadenciado({
        campanha,
        logId,
        intervaloEntreLotesMs,
        quantidadePorLote,
      });
    } catch (error) {
      await LogCampanha.findByIdAndUpdate(logId, {
        $set: {
          status: "ABORTADO",
          finalizadoEm: new Date(),
        },
      });
    }
  }, atrasoSeguro);

  timersAgendamentos.set(chave, timer);
}

async function agendarCampanhaComCadencia({
  campanha,
  userId,
  agendamentos,
  intervaloEntreLotesMs = 2000,
  quantidadePorLote = 20,
}) {
  const erros = [];

  const datasAgendamento = Array.isArray(agendamentos)
    ? agendamentos.map((data) => (data instanceof Date ? data : new Date(data)))
    : [];

  const errosDatas = validarDatasAgendamento(datasAgendamento);

  if (errosDatas.length > 0) {
    return {
      ok: false,
      erros: errosDatas,
    };
  }

  const contatos = normalizarListaContatos(campanha);

  if (!Array.isArray(contatos) || contatos.length === 0) {
    erros.push({
      texto: "A campanha não possui clientes para envio.",
    });
  }

  const hsmId = obterHsmId(campanha);
  const contaId = obterContaId(campanha);
  const flowId = obterFlowId(campanha);
  const sendType = obterSendType(campanha);
  const forcaEnvio = obterForcaEnvio(campanha);

  if (!userId) {
    erros.push({ texto: "Usuário não identificado." });
  }

  if (!hsmId) {
    erros.push({ texto: "HSM não identificado na campanha." });
  }

  if (!contaId) {
    erros.push({ texto: "Conta não identificada na campanha." });
  }

  if (!sendType || Number.isNaN(sendType)) {
    erros.push({ texto: "Tipo de envio não identificado na campanha." });
  }

  if (erros.length > 0) {
    return {
      ok: false,
      erros,
    };
  }

  const totalAgendamentos = datasAgendamento.length;
  const gruposClientes = dividirContatosPorAgendamento(
    contatos,
    totalAgendamentos,
  );

  const grupoAgendamento = new mongoose.Types.ObjectId().toString();

  const logsCriados = [];

  for (let i = 0; i < totalAgendamentos; i++) {
    const dataAgendada = datasAgendamento[i];
    const clientesDoAgendamento = gruposClientes[i];

    const campanhaParcial = montarCampanhaParcial(
      campanha,
      clientesDoAgendamento,
    );

    const log = await LogCampanha.create({
      userId,
      hsmId,
      flow: flowId || null,
      conta: contaId,
      agendamentos: [dataAgendada],
      agendadoPara: dataAgendada,
      grupoAgendamento,
      indiceAgendamento: i + 1,
      campanhaSnapshot: campanhaParcial,
      sendType,
      forcaEnvio,
      total: clientesDoAgendamento.length,
      sucessos: 0,
      erros: 0,
      status: "AGUARDANDO",
      finalizadoEm: null,
    });

    agendarExecucaoDoLog({
      logId: log._id,
      campanha: campanhaParcial,
      dataAgendada,
      intervaloEntreLotesMs,
      quantidadePorLote,
    });

    logsCriados.push(log);
  }

  return {
    ok: true,
    grupoAgendamento,
    logs: logsCriados,
    totalClientes: contatos.length,
    totalAgendamentos,
  };
}

async function recuperarAgendamentosPendentes({
  intervaloEntreLotesMs = 2000,
  quantidadePorLote = 20,
} = {}) {
  const logsPendentes = await LogCampanha.find({
    status: "AGUARDANDO",
    agendadoPara: {
      $ne: null,
    },
    campanhaSnapshot: {
      $ne: null,
    },
  }).lean();

  for (const log of logsPendentes) {
    const dataAgendada = log.agendadoPara || log.agendamentos?.[0];

    if (!dataAgendada) {
      continue;
    }

    agendarExecucaoDoLog({
      logId: log._id,
      campanha: log.campanhaSnapshot,
      dataAgendada: new Date(dataAgendada),
      intervaloEntreLotesMs,
      quantidadePorLote,
    });
  }

  return {
    ok: true,
    totalRecuperados: logsPendentes.length,
  };
}

async function cancelarAgendamentoCampanha(logId) {
  limparTimerAgendamento(logId);

  const log = await LogCampanha.findOneAndUpdate(
    {
      _id: logId,
      status: "AGUARDANDO",
    },
    {
      $set: {
        status: "CANCELADO",
        finalizadoEm: new Date(),
      },
    },
    {
      new: true,
    },
  );

  if (!log) {
    return {
      ok: false,
      erros: [
        {
          texto: "Agendamento não encontrado ou já iniciado.",
        },
      ],
    };
  }

  return {
    ok: true,
    log,
  };
}

module.exports = {
  agendarCampanhaComCadencia,
  recuperarAgendamentosPendentes,
  cancelarAgendamentoCampanha,
};
