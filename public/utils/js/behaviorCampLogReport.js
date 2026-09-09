document.addEventListener("DOMContentLoaded", () => {
  const formRelatorio = document.getElementById("formRelatorioAnalitico");
  const areaResultado = document.getElementById("areaResultado");
  const tbodyLogs = document.getElementById("tbodyLogs");
  const paginacaoLogs = document.getElementById("paginacaoLogs");
  const totalRegistrosTexto = document.getElementById("totalRegistrosTexto");
  const paginaAtualTexto = document.getElementById("paginaAtualTexto");
  const alertaResultado = document.getElementById("alertaResultado");
  const btnBaixarCsv = document.getElementById("btnBaixarCsv");
  const statusColorBadges = {
    CANCELADO: "badge badge-warning",
    FINALIZADO: "badge badge-success",
    ABORTADO: "badge badge-danger",
    ENVIANDO: "badge badge-primary",
    AGUARDANDO: "badge badge-secondary",
  };

  let paginaAtual = 1;
  const limitePorPagina = 10;
  let ultimoFiltro = new URLSearchParams();

  function formatarData(data) {
    if (!data) return "-";

    const date = new Date(data);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("pt-BR");
  }

  function escaparHtml(valor) {
    if (valor === null || valor === undefined) return "";

    return String(valor)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function montarFiltrosFormulario() {
    const formData = new FormData(formRelatorio);
    const params = new URLSearchParams();

    for (const [chave, valor] of formData.entries()) {
      if (valor) {
        params.append(chave, valor);
      }
    }

    return params;
  }

  function renderizarLogs(registros) {
    tbodyLogs.innerHTML = "";

    if (!registros || registros.length === 0) {
      tbodyLogs.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-4">
            Nenhum log encontrado para os filtros informados.
          </td>
        </tr>
      `;

      return;
    }

    registros.forEach((log) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="text-end">${log.hsm}</td>
        <td>${log.usuario}</td>
        <td>${formatarData(log.createdAt)}</td>
        <td>${formatarData(log.finalizadoEm)}</td>
        <td class="text-end">${Number(log.total || 0)}</td>
        <td class="text-end text-success">${Number(log.sucessos || 0)}</td>
        <td class="text-end text-danger">${Number(log.erros || 0)}</td>
        <td>
          <span class="${statusColorBadges[log.status]}">
            ${escaparHtml(log.status || "-")}
          </span>
        </td>
      `;

      tbodyLogs.appendChild(tr);
    });
  }

  function criarItemPaginacao(label, page, disabled = false, active = false) {
    const li = document.createElement("li");
    li.className = "page-item";

    if (disabled) li.classList.add("disabled");
    if (active) li.classList.add("active");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-link";
    button.textContent = label;

    if (!disabled && !active) {
      button.addEventListener("click", () => {
        buscarLogs(page);
      });
    }

    li.appendChild(button);

    return li;
  }

  function renderizarPaginacao(page, totalPaginas) {
    paginacaoLogs.innerHTML = "";

    if (!totalPaginas || totalPaginas <= 1) {
      paginaAtualTexto.textContent = "";
      return;
    }

    paginaAtualTexto.textContent = `Página ${page} de ${totalPaginas}`;

    paginacaoLogs.appendChild(
      criarItemPaginacao("Anterior", page - 1, page <= 1),
    );

    const inicio = Math.max(1, page - 2);
    const fim = Math.min(totalPaginas, page + 2);

    for (let i = inicio; i <= fim; i++) {
      paginacaoLogs.appendChild(
        criarItemPaginacao(String(i), i, false, i === page),
      );
    }

    paginacaoLogs.appendChild(
      criarItemPaginacao("Próxima", page + 1, page >= totalPaginas),
    );
  }

  async function buscarLogs(page = 1) {
    paginaAtual = page;

    const params = new URLSearchParams(ultimoFiltro);
    params.set("page", String(page));
    params.set("limit", String(limitePorPagina));

    areaResultado.classList.remove("d-none");
    alertaResultado.classList.remove("d-none");
    alertaResultado.className = "alert alert-info mb-3";
    alertaResultado.textContent = "Pesquisando logs...";

    try {
      const response = await fetch(
        `/report/analitico/logs?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar logs.");
      }

      const data = await response.json();

      renderizarLogs(data.registros);
      renderizarPaginacao(data.page, data.totalPaginas);

      totalRegistrosTexto.textContent = `${data.totalRegistros} registro(s) encontrado(s)`;

      alertaResultado.classList.add("d-none");
      alertaResultado.textContent = "";
    } catch (error) {
      console.error(error);

      alertaResultado.className = "alert alert-danger mb-3";
      alertaResultado.textContent = "Não foi possível carregar os logs.";
    }
  }

  formRelatorio.addEventListener("submit", function (event) {
    event.preventDefault();

    ultimoFiltro = montarFiltrosFormulario();

    buscarLogs(1);
  });

  btnBaixarCsv.addEventListener("click", function () {
    const params = new URLSearchParams(ultimoFiltro);

    const url = `/report/analitico/logs/csv?${params.toString()}`;

    window.location.href = url;
  });
});
