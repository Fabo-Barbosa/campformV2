// src/repositories/campanhaRepository.js
const { query, queryOne } = require("./queriesRBX");

async function buscarClientesPorFiltro({
  status = [],
  atrasoInicial = 0,
  atrasoFinal = 9999,
}) {
  let sql = `
        SELECT CLI.Codigo, CLI.Nome, CLI.CNPJ_CNPF, CLI.Email, CLI.TelCelular, P.Descricao, MIN(MOV.Data) AS DataMaisAntiga, 
        CLI.UF, CLI.Cidade, CLI.Bairro, CLI.Endereco, CLI.CEP, CLI.Numero, CLI.Complemento
        FROM Clientes CLI

        JOIN Contratos CON
          ON CON.Cliente = CLI.Codigo 
        #AND CON.Situacao != 'C'
        AND CON.Situacao != 'S'
        AND CON.Situacao != 'T'
        AND NOT EXISTS (
                SELECT 1 FROM Atendimentos ATD
                WHERE ATD.Cliente = CLI.Codigo
                  AND ATD.Fluxo IN (392, 393, 397)
                  AND ATD.Data_BX IS NULL
            )

        JOIN Planos P ON CON.Plano = P.Codigo AND P.Tipo = 'M'

        JOIN MovimentoContrato MOVC
          ON MOVC.Contrato = CON.Numero
        JOIN Movimento MOV
          ON CLI.Codigo = MOV.Cliente
        AND MOVC.Sequencia = MOV.Sequencia
        AND MOV.DataBaixa IS NULL 
        AND CLI.Situacao IN ('A', 'B', 'C', 'S', 'E')
          `;

  const params = [];

  if (status.length > 0) {
    const placeholders = status.map(() => "?").join(", ");
    sql += ` AND CON.Situacao IN (${placeholders})`;
    params.push(...status);
  }

  params.push(atrasoFinal);
  params.push(atrasoInicial);

  sql += `AND MOV.Estornado = 'N'
        AND CLI.Tipo = 'F'
        GROUP BY CLI.Codigo
        HAVING DataMaisAntiga BETWEEN DATE_SUB(CURDATE(), INTERVAL ? DAY) AND DATE_SUB(CURDATE(), INTERVAL ? DAY)
        ORDER BY CLI.Codigo;
        `;

  return query(sql, params);
}

async function contarClientesPorFiltro({
  status = [],
  atrasoInicial = 0,
  atrasoFinal = 9999,
}) {
  let sql = `
    SELECT COUNT(*) AS total
    FROM clientes
    WHERE dias_atraso BETWEEN ? AND ?
  `;

  const params = [atrasoInicial, atrasoFinal];

  if (status.length > 0) {
    const placeholders = status.map(() => "?").join(", ");
    sql += ` AND status_contrato IN (${placeholders})`;
    params.push(...status);
  }

  return queryOne(sql, params);
}

module.exports = {
  buscarClientesPorFiltro,
  contarClientesPorFiltro,
};
