// services/campaignService.js
require("dotenv").config();

class CampaignApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "CampaignApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function listarCampanhas() {
  const baseUrl = process.env.DISCADOR_API_URL;
  const apiToken = process.env.DISCADOR_API_TOKEN;

  if (!baseUrl) {
    throw new CampaignApiError(
      "A variável DISCADOR_API_URL não foi configurada.",
      500,
    );
  }

  if (!apiToken) {
    throw new CampaignApiError(
      "A variável DISCADOR_API_TOKEN não foi configurada.",
      500,
    );
  }

  let url = new URL("campaigns", baseUrl);
  url.searchParams.set("api_token", apiToken);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let lista_campanhas = [];

  try {
    while (true) {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new CampaignApiError(
          data?.detail ||
            data?.title ||
            "Erro ao consultar campanhas no discador.",
          response.status,
          data,
        );
      }

      if (!Array.isArray(data["data"])) {
        throw new CampaignApiError(
          "Resposta inválida da API de campanhas. Era esperado um array.",
          502,
          data,
        );
      }

      lista_campanhas = lista_campanhas.concat(
        data["data"]
          .filter(
            (campaign) =>
              campaign && campaign.id !== undefined && campaign.name,
          )
          .map((campaign) => ({
            id: String(campaign.id),
            name: campaign.name,
          })),
      );

      if (data["meta"]["pagination"]["links"]["next"]) {
        url = new URL(data["meta"]["pagination"]["links"]["next"]);
        url.searchParams.set("api_token", apiToken);
      } else {
        return lista_campanhas;
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new CampaignApiError(
        "Tempo limite excedido ao consultar campanhas.",
        504,
      );
    }

    if (error instanceof CampaignApiError) {
      throw error;
    }

    throw new CampaignApiError(
      "Falha inesperada ao consultar campanhas.",
      500,
      error.message,
    );
  } finally {
    clearTimeout(timeout);
  }
}

function getApiConfig() {
  const baseUrl = process.env.DISCADOR_API_URL;
  const apiToken = process.env.DISCADOR_API_TOKEN;

  if (!baseUrl) {
    throw new CampaignApiError(
      "A variável DISCADOR_API_URL não foi configurada.",
      500,
    );
  }

  if (!apiToken) {
    throw new CampaignApiError(
      "A variável DISCADOR_API_TOKEN não foi configurada.",
      500,
    );
  }

  return { baseUrl, apiToken };
}

function buildDiscadorUrl(path) {
  const { baseUrl, apiToken } = getApiConfig();

  const baseUrlFormatada = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const pathFormatado = path.startsWith("/") ? path.substring(1) : path;

  const url = new URL(pathFormatado, baseUrlFormatada);
  url.searchParams.set("api_token", apiToken);

  return url;
}

async function requestDiscador(path, options = {}) {
  const url = buildDiscadorUrl(path);

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  let data = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch (error) {
      throw new CampaignApiError(
        `A API do discador não retornou JSON válido. Prévia do retorno: ${rawBody.slice(0, 300)}`,
        response.status || 502,
        {
          contentType,
          bodyPreview: rawBody.slice(0, 500),
          parseError: error.message,
        },
      );
    }
  }

  if (!response.ok) {
    throw new CampaignApiError(
      data?.detail ||
        data?.title ||
        `Erro HTTP ${response.status} na API do discador.`,
      response.status,
      data,
    );
  }

  return data;
}

function normalizarId(id) {
  const idString = String(id).trim();

  if (!idString) {
    return null;
  }

  return /^\d+$/.test(idString) ? Number(idString) : idString;
}

function normalizarTelefone(telefone) {
  return String(telefone || "").replace(/\D/g, "");
}

function normalizarDocumento(documento) {
  return String(documento || "").replace(/\D/g, "");
}

function dividirClientesPorCampanha(listaClientes, idsCampanha) {
  if (!Array.isArray(listaClientes) || listaClientes.length === 0) {
    throw new CampaignApiError("A lista de clientes está vazia.", 400);
  }

  if (!Array.isArray(idsCampanha) || idsCampanha.length === 0) {
    throw new CampaignApiError("Nenhuma campanha foi selecionada.", 400);
  }

  const campanhasUnicas = [
    ...new Set(idsCampanha.map((id) => String(id).trim())),
  ];

  if (campanhasUnicas.length !== idsCampanha.length) {
    throw new CampaignApiError("Existem campanhas duplicadas na seleção.", 400);
  }

  if (listaClientes.length < campanhasUnicas.length) {
    throw new CampaignApiError(
      "A quantidade de clientes é menor que a quantidade de campanhas selecionadas.",
      400,
    );
  }

  const quantidadeCampanhas = campanhasUnicas.length;
  const tamanhoBase = Math.floor(listaClientes.length / quantidadeCampanhas);
  const sobra = listaClientes.length % quantidadeCampanhas;

  let inicio = 0;

  return campanhasUnicas.map((campaignId, index) => {
    const tamanhoLista = tamanhoBase + (index < sobra ? 1 : 0);
    const fim = inicio + tamanhoLista;

    const clientesDaCampanha = listaClientes.slice(inicio, fim);

    inicio = fim;

    return {
      campaignId,
      clientes: clientesDaCampanha,
    };
  });
}

function montarMailing(clientes) {
  return clientes.map((cliente) => {
    const phone = normalizarTelefone(cliente.telCelular);
    const identifier = normalizarDocumento(
      cliente.cnpj_cnpf || cliente.cnpj_cpf || cliente.cpfCnpj,
    );

    const name = String(cliente.nome || "").trim();

    if (!phone) {
      throw new CampaignApiError(
        `Cliente sem telefone válido: ${name || identifier || "sem identificação"}`,
        400,
        cliente,
      );
    }

    if (!identifier) {
      throw new CampaignApiError(
        `Cliente sem CPF/CNPJ válido: ${name || phone}`,
        400,
        cliente,
      );
    }

    if (!name) {
      throw new CampaignApiError(
        `Cliente sem nome válido: ${identifier || phone}`,
        400,
        cliente,
      );
    }

    return {
      phone,
      identifier,
      data: {
        name,
      },
    };
  });
}

function extrairListId(responseData) {
  return (
    responseData?.id ||
    responseData?.list?.id ||
    responseData?.data?.id ||
    responseData?.mailing_list?.id
  );
}

async function criarListaNaCampanha(campaignId, nomeLista) {
  const campaignIdNormalizado = normalizarId(campaignId);

  if (!campaignIdNormalizado) {
    throw new CampaignApiError("ID da campanha inválido.", 400, { campaignId });
  }

  if (!nomeLista || !String(nomeLista).trim()) {
    throw new CampaignApiError("Nome da lista não informado.", 400);
  }

  const body = {
    name: String(nomeLista).trim(),
    "campaign-id": campaignIdNormalizado,
  };

  const responseData = await requestDiscador(
    `/campaigns/${encodeURIComponent(campaignIdNormalizado)}/lists`,
    {
      method: "POST",
      body,
    },
  );

  const listId = extrairListId(responseData);

  if (!listId) {
    throw new CampaignApiError(
      "A lista foi criada, mas a API não retornou o ID da lista.",
      502,
      responseData,
    );
  }

  return {
    campaignId: campaignIdNormalizado,
    listId,
    nomeLista: body.name,
    raw: responseData,
  };
}

async function adicionarContatosNaLista(campaignId, listId, clientes) {
  const campaignIdNormalizado = normalizarId(campaignId);
  const listIdNormalizado = normalizarId(listId);

  if (!campaignIdNormalizado) {
    throw new CampaignApiError(
      "ID da campanha inválido ao adicionar contatos.",
      400,
    );
  }

  if (!listIdNormalizado) {
    throw new CampaignApiError(
      "ID da lista inválido ao adicionar contatos.",
      400,
    );
  }

  const mailing = montarMailing(clientes);

  if (mailing.length === 0) {
    throw new CampaignApiError(
      "Nenhum contato válido para adicionar à lista.",
      400,
    );
  }

  const responseData = await requestDiscador(
    `/campaigns/${encodeURIComponent(campaignIdNormalizado)}/lists/${encodeURIComponent(listIdNormalizado)}/mailing.json`,
    {
      method: "POST",
      body: mailing,
    },
  );

  return {
    campaignId: campaignIdNormalizado,
    listId: listIdNormalizado,
    totalContatos: mailing.length,
    raw: responseData,
  };
}

async function criarListasComMailing(payload) {
  const { lista_clientes, idsCampanha, nome } = payload;

  if (!nome || !String(nome).trim()) {
    throw new CampaignApiError("Nome da lista não informado.", 400);
  }

  const divisao = dividirClientesPorCampanha(lista_clientes, idsCampanha);

  const resultado = [];

  for (const item of divisao) {
    const { campaignId, clientes } = item;

    const listaCriada = await criarListaNaCampanha(campaignId, nome);

    const mailingCriado = await adicionarContatosNaLista(
      campaignId,
      listaCriada.listId,
      clientes,
    );

    resultado.push({
      campaignId: String(campaignId),
      listId: String(listaCriada.listId),
      nomeLista: listaCriada.nomeLista,
      totalClientes: clientes.length,
      totalContatosEnviados: mailingCriado.totalContatos,
    });
  }

  return {
    nomeLista: String(nome).trim(),
    totalClientes: lista_clientes.length,
    totalCampanhas: idsCampanha.length,
    listasCriadas: resultado,
  };
}

module.exports = {
  criarListasComMailing,
  dividirClientesPorCampanha,
  criarListaNaCampanha,
  adicionarContatosNaLista,
  listarCampanhas,
  CampaignApiError,
};
