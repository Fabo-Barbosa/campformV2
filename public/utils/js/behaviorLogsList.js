document.addEventListener("DOMContentLoaded", () => {
  const btnAtualizar = document.getElementById("btnAtualizarLogs");
  const tableBody = document.getElementById("logsTableBody");

  if (!btnAtualizar || !tableBody) return;

  btnAtualizar.addEventListener("click", async () => {
    const rows = Array.from(tableBody.querySelectorAll("tr[data-log-id]"));
    if (!rows.length) {
      mostrarFeedback("Nenhum log encontrado para atualizar.", "warning");
      return;
    }

    const ids = rows.map((row) => row.dataset.logId);

    const scrollAtual = window.scrollY;

    try {
      const response = await fetch("/campanha/log/api/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error("Erro ao consultar logs atualizados.");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Não foi possível atualizar os logs.");
      }

      atualizarLinhasDaTabela(data.logs);

      window.scrollTo({
        top: scrollAtual,
        behavior: "instant",
      });

      mostrarFeedback("Logs atualizados com sucesso.", "success");
    } catch (error) {
      console.error(error);
      mostrarFeedback(error.message, "danger");
    }
  });

  function atualizarLinhasDaTabela(logsAtualizados) {
    logsAtualizados.forEach((log) => {
      const row = tableBody.querySelector(`tr[data-log-id="${log._id}"]`);

      if (!row) return;

      atualizarCampo(row, "hsm", log.hsm.cod);
      atualizarCampo(row, "dataInicio", log.dataInicio);
      atualizarCampo(row, "dataFinal", log.dataFinal);
      atualizarCampo(row, "total", log.total);
      atualizarCampo(row, "sucessos", log.sucessos);
      atualizarCampo(row, "erros", log.erros);
      atualizarCampo(row, "usuario", log.usuario);

      atualizarStatus(row, log.status);
      destacarLinha(row);
    });
  }

  function atualizarCampo(row, field, value) {
    const cell = row.querySelector(`[data-field="${field}"]`);

    if (!cell) return;

    const novoValor = value ?? "";

    if (cell.textContent.trim() !== String(novoValor).trim()) {
      cell.textContent = novoValor;
      destacarCelula(cell);
    }
  }

  function atualizarStatus(row, status) {
    const cell = row.querySelector('[data-field="status"]');

    if (!cell) return;

    const badgeClass = getStatusClass(status);

    cell.innerHTML = `
      <span class="badge ${badgeClass}">
        ${escapeHtml(status || "SEM STATUS")}
      </span>
    `;
  }

  function getStatusClass(status) {
    const statusNormalizado = String(status || "").toUpperCase();

    switch (statusNormalizado) {
      case "FINALIZADO":
        return "badge-success";

      case "ENVIANDO":
      case "EM ANDAMENTO":
        return "badge-primary";

      case "AGUARDANDO":
        return "badge-secondary";

      case "ABORTADO":
        return "badge-danger";

      case "CANCELADO":
        return "badge-warning";

      default:
        return "bg-dark";
    }
  }

  function destacarCelula(cell) {
    cell.classList.add("table-warning");

    setTimeout(() => {
      cell.classList.remove("table-warning");
    }, 1200);
  }

  function destacarLinha(row) {
    row.classList.add("table-active");

    setTimeout(() => {
      row.classList.remove("table-active");
    }, 800);
  }

  function setLoading(isLoading) {
    btnAtualizar.disabled = isLoading;

    btnAtualizar.innerHTML = isLoading
      ? `
        <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
        Atualizando...
      `
      : "";
  }

  function mostrarFeedback(message, type = "info") {
    let feedback = document.getElementById("logsRefreshFeedback");

    feedback.innerHTML = `
      <div class="alert alert-${type} py-2 mb-0">
        ${escapeHtml(message)}
      </div>
    `;

    setTimeout(() => {
      feedback.innerHTML = "";
    }, 3000);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
