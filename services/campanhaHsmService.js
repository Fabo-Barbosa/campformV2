const {
  buscarClientesPorFiltro,
} = require("../repositories/campanhaHsmRepository");

async function consultarResumoCampanha(filtros) {
  const clientes = await buscarClientesPorFiltro(filtros);

  const total = clientes.length || 0;

  const primeirosNomes = clientes.slice(0, 10).map((cliente) => cliente.Nome);

  return {
    total: total,
    primeirosNomes: primeirosNomes,
  };
}

// Em Desenvolvimento +++++++++++++++++++
async function enviarCampanha(campanha) {
  if (!(campanha instanceof Campanha)) {
    throw new Error("O parâmetro enviado deve ser uma instância de Campanha.");
  }

  const validacao = campanha.validarCampanha();

  if (!validacao.ok) {
    throw new Error(validacao.mensagem);
  }

  const formatApiJson = (index) => {};

  const response = await fetch("/api/campanhas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(campanha.toJSON()),
  });

  if (!response.ok) {
    throw new Error(`Erro ao enviar campanha. Status: ${response.status}`);
  }

  return await response.json();
}

module.exports = {
  consultarResumoCampanha,
};
