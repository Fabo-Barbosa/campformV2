const express = require("express");
const router = express.Router();
const slotsCampanha = require("../classes/CampaignSlotManager");
const { consultarResumoCampanha } = require("../services/querieRbxServices");
const Cliente = require("../classes/Cliente");

// Endpoints de retorno de dados
router.post("/lista", async (req, res) => {
  try {
    // Verificação de slots de campanha
    const userId = res.locals.user._id;
    const slot = slotsCampanha.ocuparPosicao(userId.toString(), req.body.tipo);
    if (!slot) {
      console.error("Slots de campanhas indisponíveis", error);

      return res.status(226).json({
        success: false,
        message: "Aguarde até que um slot seja liberado.",
      });
    }

    if (slot.reutilizada) slot.campanha.reset();

    const filtros = {
      status: req.body.status || [],
      atrasoInicial: Number(req.body.atrasoInicial || 0),
      atrasoFinal: Number(req.body.atrasoFinal || 9999),
    };

    const resultado = await consultarResumoCampanha(filtros);

    resultado.data.forEach((c) => {
      slot.campanha.adicionarCliente(
        new Cliente(
          c.Codigo,
          c.Nome,
          c.CNPJ_CNPF,
          c.Email,
          c.TelCelular,
          c.UF,
          c.Cidade,
          c.Bairro,
          c.Endereco,
          c.CEP,
          c.Numero,
          c.Complemento,
        ),
      );
    });

    return res.json({
      success: true,
      slotKey: slot.chave,
      data: {
        total: resultado.total,
        primeirosNomes: resultado.data
          .slice(0, 10)
          .map((cliente) => cliente.Nome),
      },
    });
  } catch (error) {
    console.error("Erro na rota /cliente/lista:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao consultar campanha",
    });
  }
});

module.exports = router;
