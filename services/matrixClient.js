// src/services/crmClient.service.js

const CRM_ENDPOINT =
  process.env.CRM_ENDPOINT || "http://localhost:3000/api/mock-crm/enviar";

function validarEnvioIndividual(payload) {
  const erros = [];

  if (!payload.cod_conta) erros.push("cod_conta é obrigatório.");
  if (!payload.tipo_envio) erros.push("tipo_envio é obrigatório.");
  if (!payload.hsm) erros.push("hsm é obrigatório.");

  const tipoEnvio = Number(payload.tipo_envio);

  if (tipoEnvio === 1 && !payload.cod_flow) {
    erros.push("cod_flow é obrigatório para tipo_envio 1.");
  }

  if (!payload.contato) {
    erros.push("contato é obrigatório.");
  } else {
    if (!payload.contato.nome) erros.push("contato.nome é obrigatório.");
    if (!payload.contato.telefone)
      erros.push("contato.telefone é obrigatório.");
  }

  return erros;
}

async function enviarContatoParaMtrx(payload) {
  const erros = validarEnvioIndividual(payload);

  if (erros.length > 0) {
    const error = new Error("Payload inválido para envio ao CRM.");
    error.validationErrors = erros;
    throw error;
  }

  const response = await fetch(CRM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error("CRM retornou erro HTTP.");
    error.status = response.status;
    error.response = data;
    throw error;
  }

  if (!data || Number(data.cod_error) !== 0) {
    const error = new Error(data?.msg || "CRM recusou o envio.");
    error.response = data;
    throw error;
  }

  return data;
}

module.exports = {
  enviarContatoParaMtrx,
};
