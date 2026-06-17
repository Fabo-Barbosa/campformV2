// public/js/campaign-multi-select.js

document.addEventListener("DOMContentLoaded", () => {
  const campaignSelect = document.getElementById("campaignSelect");
  const btnAdicionar = document.getElementById("btnAdicionarCampanha");
  const selectedList = document.getElementById("campaignSelectedList");
  const emptyMessage = document.getElementById("emptyCampaignMessage");

  const selectedCampaigns = new Map();

  function atualizarMensagemVazia() {
    if (!emptyMessage) return;

    emptyMessage.style.display =
      selectedCampaigns.size === 0 ? "block" : "none";
  }

  function criarItemCampanha(campaignId, campaignName) {
    const item = document.createElement("div");
    item.className =
      "campaign-selected-item d-flex align-items-center justify-content-between border rounded p-2";
    item.dataset.campaignId = campaignId;

    const nameSpan = document.createElement("span");
    nameSpan.textContent = campaignName;

    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "campaignIds[]";
    hiddenInput.value = campaignId;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-sm btn-outline-danger";
    removeButton.textContent = "X";

    removeButton.addEventListener("click", () => {
      selectedCampaigns.delete(campaignId);
      item.remove();
      atualizarMensagemVazia();
    });

    item.appendChild(nameSpan);
    item.appendChild(hiddenInput);
    item.appendChild(removeButton);

    return item;
  }

  function adicionarCampanha() {
    const selectedOption = campaignSelect.options[campaignSelect.selectedIndex];

    if (!selectedOption || !selectedOption.value) {
      alert("Selecione uma campanha antes de adicionar.");
      return;
    }

    const campaignId = selectedOption.value;
    const campaignName = selectedOption.textContent.trim();

    if (selectedCampaigns.has(campaignId)) {
      alert("Essa campanha já foi adicionada.");
      return;
    }

    selectedCampaigns.set(campaignId, campaignName);

    const item = criarItemCampanha(campaignId, campaignName);
    selectedList.appendChild(item);

    campaignSelect.value = "";
    atualizarMensagemVazia();
  }

  btnAdicionar.addEventListener("click", adicionarCampanha);

  campaignSelect.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      adicionarCampanha();
    }
  });

  atualizarMensagemVazia();

  // Lógica de consulta e atualização de cnoteúdos dinâmicos
  const elements = {
    form: document.querySelector("#campaignForm"),
    btnConsultar: document.querySelector("#btnConsultar"),

    summaryQuantidade: document.querySelector("#resumoTotalPessoas"),
    summaryClientes: document.querySelector("#resumoClientesPreview"),
  };

  if (!elements.form || !elements.btnConsultar) {
    return;
  }

  const endpoints = {
    consultarClientes: "/campanha/clientes/",
    ultimaQuantidadeConsulta: "/campanha/count/",
  };

  elements.btnConsultar.addEventListener("click", handleConsultarClick);

  async function handleConsultarClick() {
    try {
      const parametrosConsulta = getFormConsultaData();
      if (!parametrosConsulta) {
        alert(
          "Os campos da consulta não foram devidamente preenchidos. Para evitar consultas longas preencha-os corretamente.",
        );
        return;
      }

      showLoading(
        (title = "Consultando Clientes"),
        (subtitle = "Aguarde enquanto a consulta é realizada..."),
      );

      const response = await fetchJson(endpoints.consultarClientes, {
        method: "POST",
        body: JSON.stringify(parametrosConsulta),
      });

      hideLoading();
      renderConsulta(
        Number(response.data.total || 0),
        Array.isArray(response.data.primeirosNomes)
          ? response.data.primeirosNomes
          : [],
      );
    } catch (error) {
      hideLoading();
      elements.summaryQuantidade.textContent = "Erro ao consultar clientes.";
      elements.summaryClientes.innerHTML =
        "<li>Não foi possível carregar os clientes.</li>";

      console.error(error);
    }
  }

  async function fetchJson(url, options = {}) {
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    return response.json();
  }

  function getFormConsultaData() {
    const data = {};
    const status = Array.from(
      document.querySelectorAll(
        'input[class="form-check-input statusContrato"]:checked',
      ),
    ).map((item) => item.value);
    const faixaInicial = document.querySelector("#faixaInicial").value;
    const faixaFinal = document.querySelector("#faixaFinal").value;
    if (status.length === 0 || !faixaInicial || !faixaFinal) return null;
    data["status"] = status;
    data["atrasoInicial"] = faixaInicial;
    data["atrasoFinal"] = faixaFinal;
    data["tipo"] = 2;

    return data;
  }

  function renderConsulta(quantidade, nomes) {
    elements.summaryQuantidade.textContent = quantidade.toLocaleString("pt-BR");

    if (!nomes.length) {
      elements.summaryClientes.innerHTML =
        "<li>Nenhum cliente encontrado.</li>";
      return;
    }

    elements.summaryClientes.innerHTML = nomes
      .slice(0, 10)
      .map((nome) => `<li class="ml-4">${escapeHtml(nome)}</li>`)
      .join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
