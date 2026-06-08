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

  const url = new URL("campaigns", baseUrl);
  url.searchParams.set("api_token", apiToken);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
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

    return data["data"]
      .filter(
        (campaign) => campaign && campaign.id !== undefined && campaign.name,
      )
      .map((campaign) => ({
        id: String(campaign.id),
        name: campaign.name,
      }));
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

module.exports = {
  listarCampanhas,
  CampaignApiError,
};
