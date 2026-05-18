const {
  buscarClientesPorFiltro,
} = require("../repositories/campanhaHsmRepository");

async function consultarResumoCampanha(filtros) {
  const clientes = await buscarClientesPorFiltro(filtros);

  const total = clientes.length || 0;

  //const primeirosNomes = clientes.slice(0, 10).map((cliente) => cliente.Nome);
  const data = clientes;

  return {
    total: total,
    data: data,
  };
}

module.exports = {
  consultarResumoCampanha,
};
