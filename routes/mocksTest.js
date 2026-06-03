// src/routes/mockCrm.routes.js

const express = require("express");

const router = express.Router();

function validarPayloadCRM(body) {
  const erros = [];

  if (!body.cod_conta) erros.push("cod_conta é obrigatório.");
  if (!body.tipo_envio) erros.push("tipo_envio é obrigatório.");
  if (!body.hsm) erros.push("hsm é obrigatório.");

  const tipoEnvio = Number(body.tipo_envio);

  if (tipoEnvio === 1 && !body.cod_flow) {
    erros.push("cod_flow é obrigatório quando tipo_envio for 1.");
  }

  if (!body.contato) {
    erros.push("contato é obrigatório.");
  } else {
    if (!body.contato.nome) erros.push("contato.nome é obrigatório.");
    if (!body.contato.telefone) erros.push("contato.telefone é obrigatório.");
  }

  return erros;
}

router.post("/enviar", async (req, res) => {
  const erros = validarPayloadCRM(req.body || {});

  if (erros.length > 0) {
    return res.status(400).json({
      cod_error: 1,
      msg: "Payload inválido.",
      erros,
    });
  }

  return res.status(200).json({
    cod_error: 0,
    msg: "Atendimento gerado com sucesso",
    cod_atendimento: "1651734",
    cod_mensagem: "12822160",
  });
});

module.exports = router;
