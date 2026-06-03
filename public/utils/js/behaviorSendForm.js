// Contexto: formulário de envio de hsm principal
document.addEventListener("DOMContentLoaded", () => {
  // Remove ou adiciona a seleção de fluxos dependendo do tipo de envio
  const tipoEnvio = document?.getElementById("tipoenvio");
  tipoEnvio?.addEventListener("change", function () {
    if (this.value == 2) {
      document.querySelector(`label[for="fluxo"]`)?.remove();
      document.querySelector(`#fluxo`)?.remove();
    } else if (this.value == 1) {
      const containerFluxo = document?.getElementById("containerFluxo");
      const labelFluxo = document.createElement("label");
      labelFluxo.className = "form-label section-label";
      labelFluxo.setAttribute("for", "fluxo");
      labelFluxo.textContent = "Fluxo";
      containerFluxo.appendChild(labelFluxo);

      const selectFluxo = document.createElement("select");
      selectFluxo.className = "form-control mb-4";
      selectFluxo.name = "fluxoMatrix";
      selectFluxo.id = "fluxo";
      selectFluxo.required = true;
      containerFluxo.appendChild(selectFluxo);

      const event = new Event("change");
      document.querySelector(`#conta`).dispatchEvent(event);
    }
  });

  // Lógica de alimentação de selects
  // Gatillho: Select de conta, cada conta possui um ou mais hsms ou fluxos
  // vinculados ao seu documento
  // func: Alimenta o select de hsm baseado na conta selecionado
  async function alimentarSelectHsmPorConta(valorSelecionado) {
    const idSelectHsms = "hsm";
    limparSelect(idSelectHsms);
    try {
      const resHsms = await fetch(`/campanha/hsms/${valorSelecionado}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!resHsms.ok) {
        throw new Error(`Erro ao buscar hsms: ${resHsms.status}`);
      }

      const hsms = await resHsms.json();
      var listaHsms = mapearParaListaPadrao(hsms["data"], "_id", "name");

      if (listaHsms.length)
        listaHsms.push({ value: "", content: "Selecione um hsm do Matrix" });
      else
        listaHsms.push({
          value: "",
          content: "Não existem hsms vinculados a conta selecionada",
        });

      criarElementos(listaHsms, idSelectHsms, "option");
    } catch (error) {
      console.error("Erro ao alimentar selects:", error);
    }
  }

  // func: Alimenta o select de fluxo baseado na conta selecionado
  async function alimentarSelectFluxoPorConta(valorSelecionado) {
    const idSelectFluxos = "fluxo";
    limparSelect(idSelectFluxos);

    try {
      const resFluxos = await fetch(`/campanha/fluxos/${valorSelecionado}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!resFluxos.ok)
        throw new Error(`Erro ao buscar fluxos: ${resFluxos.status}`);

      const fluxos = await resFluxos.json();
      var listaFluxos = mapearParaListaPadrao(fluxos["data"], "_id", "name");

      if (listaFluxos.length)
        listaFluxos.push({
          value: "",
          content: "Selecione um fluxo do Matrix",
        });
      else
        listaFluxos.push({
          value: "",
          content: "Não existem fluxos vinculados a conta selecionada",
        });

      criarElementos(listaFluxos, idSelectFluxos, "option");
    } catch (error) {
      console.error("Erro ao alimentar selects:", error);
    }
  }

  document.getElementById("conta")?.addEventListener("change", function () {
    const valorSelecionado = this.value;

    if (!valorSelecionado) {
      limparSelect("fluxo", "--Selecione um Fluxo--");
      limparSelect("hsm", "--Selecione um HSM--");
      return;
    }

    if (tipoEnvio.value == 2 || !tipoEnvio.value) {
      alimentarSelectHsmPorConta(valorSelecionado);
    } else if (tipoEnvio.value == 1) {
      alimentarSelectHsmPorConta(valorSelecionado);
      alimentarSelectFluxoPorConta(valorSelecionado);
    }
  });

  // Lógica de inputs de agendamentos de acordo com a quantidade de agendamentos
  // que se deseja realizar
  function criarInputAgendamento(indice) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.flex = "1";
    wrapper.style.minWidth = "180px";

    const label = document.createElement("label");
    label.setAttribute("for", `agendamento_${indice}`);
    label.textContent = `Disparo ${indice + 1}`;

    const input = document.createElement("input");
    input.type = "datetime-local";
    input.className = "form-control";
    input.id = `agendamento_${indice}`;
    input.name = `agendamentos[${indice}]`;
    input.required = true;
    input.min = obterDateTimeLocalMinimo();

    input.addEventListener("input", function () {
      validarDataHoraFutura(input);
    });

    input.addEventListener("change", function () {
      validarDataHoraFutura(input);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);

    return wrapper;
  }

  function atualizarInputsAgendamento(selectId, containerId) {
    const select = document.getElementById(selectId);
    const container = document.getElementById(containerId);

    if (!select) {
      console.error(`Select com id "${selectId}" não encontrado.`);
      return;
    }

    if (!container) {
      console.error(`Container com id "${containerId}" não encontrado.`);
      return;
    }

    const mapaQuantidade = {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
    };

    const quantidade = mapaQuantidade[select.value] ?? 0;

    container.innerHTML = "";

    if (quantidade === 0) {
      return;
    }

    container.style.display = "flex";
    container.style.gap = "10px";
    container.style.flexWrap = "wrap";
    container.style.alignItems = "flex-start";
    container.style.marginTop = "10px";

    for (let i = 0; i < quantidade; i++) {
      container.appendChild(criarInputAgendamento(i));
    }
  }

  function validarTodosAgendamentos(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`Container com id "${containerId}" não encontrado.`);
      return false;
    }

    const inputs = container.querySelectorAll('input[type="datetime-local"]');

    for (const input of inputs) {
      if (!validarDataHoraFutura(input)) {
        input.reportValidity();
        return false;
      }
    }

    return true;
  }

  document.getElementById("divisoes")?.addEventListener("change", function () {
    atualizarInputsAgendamento("divisoes", "containerAgendamentos");
  });

  // lógica de atualização de resumo
  // Gatilhos: botão de consultar e select de hsm
  const elements = {
    form: document.querySelector("#campaignForm"),
    btnConsultar: document.querySelector("#btnConsultar"),
    hsmSelect: document.querySelector("#hsm"),

    summaryHsmTipo: document.querySelector("#resumoCategoriaHsm"),
    summaryHsmConteudo: document.querySelector("#resumoHsmContent"),
    summaryQuantidade: document.querySelector("#resumoTotalPessoas"),
    summaryValor: document.querySelector("#resumoPriceCampanha"),
    summaryClientes: document.querySelector("#resumoClientesPreview"),
  };

  if (!elements.form || !elements.btnConsultar || !elements.hsmSelect) {
    return;
  }

  const endpoints = {
    consultarClientes: "/campanha/clientes/",
    buscarHsm: "/campanha/hsm",
    calcularPreco: "/campanha/price/",
    ultimaQuantidadeConsulta: "/campanha/count/",
  };

  const state = {
    consulta: {
      realizada: false,
      parametros: null,
      quantidade: null,
      nomes: [],
    },

    hsm: {
      selecionado: false,
      id: null,
      tipo: null,
      conteudo: null,
    },

    preco: {
      disponivel: false,
      valor: null,
    },

    loading: {
      consulta: false,
      hsm: false,
      preco: false,
    },
  };

  let consultaRequestId = 0;
  let hsmRequestId = 0;
  let precoRequestId = 0;

  elements.btnConsultar.addEventListener("click", handleConsultarClick);
  elements.hsmSelect.addEventListener("change", handleHsmChange);

  async function handleConsultarClick() {
    const currentRequestId = ++consultaRequestId;

    try {
      state.loading.consulta = true;
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

      if (currentRequestId !== consultaRequestId) {
        return;
      }

      state.consulta = {
        realizada: true,
        parametros: parametrosConsulta,
        quantidade: Number(response.data.total || 0),
        nomes: Array.isArray(response.data.primeirosNomes)
          ? response.data.primeirosNomes
          : [],
      };

      state.loading.consulta = false;
      hideLoading();
      renderConsulta();

      if (state.hsm.selecionado) {
        await calcularPreco();
      } else {
        limparPreco();
        renderPreco();
      }
    } catch (error) {
      state.loading.consulta = false;
      limparConsulta();

      elements.summaryQuantidade.textContent = "Erro ao consultar clientes.";
      elements.summaryClientes.innerHTML =
        "<li>Não foi possível carregar os clientes.</li>";

      limparPreco();
      renderPreco();

      console.error(error);
    }
  }

  async function handleHsmChange() {
    const hsmId = elements.hsmSelect.value;

    if (!hsmId) {
      limparHsm();
      limparPreco();

      renderHsm();
      renderPreco();

      return;
    }

    const currentRequestId = ++hsmRequestId;

    try {
      state.loading.hsm = true;

      const response = await fetchJson(`${endpoints.buscarHsm}/${hsmId}`, {
        method: "GET",
      });

      if (currentRequestId !== hsmRequestId) {
        return;
      }

      state.hsm = {
        selecionado: true,
        id: hsmId,
        tipo: response.data.type || "Tipo não informado",
        conteudo: response.data.content || "Conteúdo não informado",
      };

      state.loading.hsm = false;

      renderHsm();

      if (state.consulta.realizada) {
        await calcularPreco();
      } else {
        limparPreco();
        renderPreco();
      }
    } catch (error) {
      state.loading.hsm = false;
      limparHsm();

      elements.summaryHsmTipo.textContent = "Erro ao carregar HSM.";
      elements.summaryHsmConteudo.textContent =
        "Não foi possível carregar o conteúdo.";

      limparPreco();
      renderPreco();

      console.error(error);
    }
  }

  async function calcularPreco() {
    if (!state.consulta.realizada || !state.hsm.selecionado) {
      limparPreco();
      renderPreco();
      return;
    }

    const currentRequestId = ++precoRequestId;

    try {
      state.loading.preco = true;

      const response = await fetchJson(endpoints.calcularPreco, {
        method: "POST",
        body: JSON.stringify({
          quantidade: state.consulta.quantidade,
          hsm_id: state.hsm.id,
        }),
      });

      if (currentRequestId !== precoRequestId) {
        return;
      }

      state.preco = {
        disponivel: true,
        valor: Number(response.value || 0),
      };

      state.loading.preco = false;

      renderPreco();
    } catch (error) {
      state.loading.preco = false;
      limparPreco();

      elements.summaryValor.textContent = "0,00";

      console.error(error);
    }
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

    return data;
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

  function renderConsulta() {
    elements.summaryQuantidade.textContent =
      state.consulta.quantidade.toLocaleString("pt-BR");

    if (!state.consulta.nomes.length) {
      elements.summaryClientes.innerHTML =
        "<li>Nenhum cliente encontrado.</li>";
      return;
    }

    elements.summaryClientes.innerHTML = state.consulta.nomes
      .slice(0, 10)
      .map((nome) => `<li class="ml-4">${escapeHtml(nome)}</li>`)
      .join("");
  }

  function renderHsm() {
    if (!state.hsm.selecionado) {
      elements.summaryHsmTipo.textContent = `<strong>Categoria: </strong>N/A`;
      elements.summaryHsmConteudo.textContent = "Nenhum conteúdo carregado";
      return;
    }

    elements.summaryHsmTipo.innerHTML = `<strong>Categoria: </strong>${state.hsm.tipo}`;
    elements.summaryHsmConteudo.textContent = state.hsm.conteudo;
  }

  function renderPreco() {
    if (
      (!state.consulta.realizada && state.hsm.selecionado) ||
      (state.consulta.realizada && !state.hsm.selecionado) ||
      (!state.consulta.realizada && !state.hsm.selecionado) ||
      !state.preco.disponivel
    ) {
      elements.summaryValor.textContent = "R$ 0,00";
      return;
    }

    elements.summaryValor.textContent = formatCurrencyBRL(state.preco.valor);
  }

  function limparConsulta() {
    state.consulta = {
      realizada: false,
      parametros: null,
      quantidade: null,
      nomes: [],
    };
  }

  function limparHsm() {
    state.hsm = {
      selecionado: false,
      id: null,
      tipo: null,
      conteudo: null,
    };
  }

  function limparPreco() {
    state.preco = {
      disponivel: false,
      valor: null,
    };
  }

  function formatCurrencyBRL(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
