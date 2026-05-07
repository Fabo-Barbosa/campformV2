// elementos Constantes
const passwordInput = document.getElementById("password");
const toggleBtn = document.getElementById("toggleBtn");
const eyeIcon = document.getElementById("eyeIcon");

// Inicialização do popover (Bootstrap 5)
var popoverTriggerList = [].slice.call(
  document.querySelectorAll('[data-toggle="popover"]'),
);
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl, {
    trigger: "focus", // O popover some quando clicar fora
  });
});

if (toggleBtn) {
  toggleBtn.addEventListener("click", function () {
    // Alterna o tipo do input
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Alterna o ícone
    if (eyeIcon.classList[0] == "close") {
      eyeIcon.classList.remove("close");
      eyeIcon.classList.add("open");
      eyeIcon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#434343"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
    } else {
      eyeIcon.classList.add("close");
      eyeIcon.classList.remove("open");
      eyeIcon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#434343"><path d="M0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0z" fill="none"/><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
    }
  });
}

// Verifica se a senha cumpri com as regras estabelecidas
function verifyPassword() {
  const passwordInput = document.getElementById("inputPassword");
  const registerBtn = document.getElementById("btnRegister");
  const minLength = 8;

  // Inicializa o popover (necessário no Bootstrap para ativar o gatilho)
  //$(passwordInput).popover('show');

  // Seleciona o corpo do popover que está renderizado no DOM
  const popoverBody = document.querySelector(".popover-body");

  if (passwordInput.value.length >= minLength) {
    // Requisito satisfeito
    if (popoverBody) {
      popoverBody.style.color = "green";
    }

    // Estilização do botão de registro
    registerBtn.removeAttribute("disabled");
  } else {
    // Requisito não satisfeito
    if (popoverBody) {
      popoverBody.style.color = "red";
    }

    // Bloqueia o botão
    registerBtn.setAttribute("disabled", "");
  }
}

// Função exibir modal para confiramar exclusão de item
document.addEventListener("DOMContentLoaded", () => {
  const deleteForm = document.getElementById("deleteConfirmForm");
  const deleteText = document.getElementById("deleteConfirmText");

  document.querySelectorAll(".js-open-delete-modal").forEach((button) => {
    button.addEventListener("click", () => {
      const deleteUrl = button.dataset.deleteUrl;
      const itemName = button.dataset.itemName || "este item";
      const itemType = button.dataset.itemType || "registro";

      deleteForm.action = deleteUrl;
      deleteText.textContent = `Tem certeza que deseja excluir o ${itemType} "${itemName}"?`;
    });
  });
});

// Exibe a camada de carregamento (overlay).
function showLoading(title = "Enviando…", subtitle = "Aguarde um instante.") {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    // Atualiza a mensagem apenas se não for 'Enviando...' (para o webhook principal)
    const textElement = loadingOverlay.querySelector(".loading-text");
    const subElement = loadingOverlay.querySelector(".loading-sub");

    if (textElement) textElement.textContent = title;
    if (subElement) subElement.textContent = subtitle;

    loadingOverlay.classList.remove("hidden");
    loadingOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
}

// cria elementos em massa de acordo com argumentos passados
function criarElementos(lista, idElementoPai, tagHtml) {
  const elementoPai = document.getElementById(idElementoPai);

  if (!elementoPai) {
    console.error(`Elemento com id "${idElementoPai}" não encontrado.`);
    return;
  }

  if (!Array.isArray(lista)) {
    console.error("O primeiro argumento deve ser uma lista de objetos.");
    return;
  }

  lista.forEach(({ value, content }) => {
    const elemento = document.createElement(tagHtml);

    if (value === "") {
      elemento.setAttribute("selected", "");
      elemento.setAttribute("disabled", "");
    }

    elemento.setAttribute("value", value);
    elemento.textContent = content;

    elementoPai.appendChild(elemento);
  });
}

// limpa um determinado select passando o id como argumento
function limparSelect(idElemento) {
  const select = document.getElementById(idElemento);

  if (!select) {
    console.error(`Select com id "${idElemento}" não encontrado.`);
    return;
  }

  select.innerHTML = "";
}

// cria uma lista value: v content: c para alimentar selects
function mapearParaListaPadrao(lista, valueKey = "cod", contentKey = "name") {
  if (!Array.isArray(lista)) return [];

  return lista.map((item) => ({
    value: item[valueKey],
    content: item[contentKey],
  }));
}

/**
 * Oculta a camada de carregamento (overlay).
 */
function hideLoading() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.classList.add("hidden");
    loadingOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

// Realiza a atualização do dom baseado em uma consulta do sql
async function consultarCampanha() {
  try {
    const statusSelecionados = Array.from(
      document.querySelectorAll('input[name="statusContrato"]:checked'),
    ).map((item) => item.value);

    const atrasoInicial = document.getElementById("faixaInicial")?.value;
    const atrasoFinal = document.getElementById("faixaFinal")?.value;

    if (!atrasoFinal || !atrasoInicial || statusSelecionados.length === 0) {
      atualizaResumo([], 0);
      return;
    }

    showLoading(
      (title = "Consultando Clientes"),
      (subtitle = "Aguarde enquanto a consulta é realizada..."),
    );
    const response = await fetch("/campanha/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: statusSelecionados,
        atrasoInicial: atrasoInicial,
        atrasoFinal: atrasoFinal,
      }),
    });

    hideLoading();
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Erro na consulta");
    }
    atualizaResumo(result.data.primeirosNomes, result.data.total);
  } catch (error) {
    console.error("Erro ao atualizar DOM:", error);
  }
}

async function alimentarSelectsHsmEFluxoPorConta(valorSelecionado) {
  const idSelectFluxos = "fluxo";
  const idSelectHsms = "hsm";

  limparSelect(idSelectFluxos);
  limparSelect(idSelectHsms);

  try {
    const [resFluxos, resHsms] = await Promise.all([
      fetch(`/campanha/fluxos/${valorSelecionado}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      fetch(`/campanha/hsms/${valorSelecionado}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    ]);

    if (!resFluxos.ok) {
      throw new Error(`Erro ao buscar fluxos: ${resFluxos.status}`);
    }

    if (!resHsms.ok) {
      throw new Error(`Erro ao buscar hsms: ${resHsms.status}`);
    }

    const fluxos = await resFluxos.json();
    const hsms = await resHsms.json();

    var listaFluxos = mapearParaListaPadrao(fluxos["data"], "_id", "name");
    var listaHsms = mapearParaListaPadrao(hsms["data"], "_id", "name");

    if (listaFluxos.length)
      listaFluxos.push({ value: "", content: "Selecione um fluxo do Matrix" });
    else
      listaFluxos.push({
        value: "",
        content: "Não existem fluxos vinculados a conta selecionada",
      });

    if (listaHsms.length)
      listaHsms.push({ value: "", content: "Selecione um hsm do Matrix" });
    else
      listaHsms.push({
        value: "",
        content: "Não existem hsms vinculados a conta selecionada",
      });

    criarElementos(listaFluxos, idSelectFluxos, "option");
    criarElementos(listaHsms, idSelectHsms, "option");
  } catch (error) {
    console.error("Erro ao alimentar selects:", error);
  }
}

function atualizaResumo(primeirosNomes, total) {
  document.getElementById("resumoTotalPessoas").textContent = total;
  // document.getElementById("resumoValorEstimado").textContent =
  //   `R$ ${result.data.valorEstimado.toFixed(2).replace(".", ",")}`;
  document.getElementById("resumoClientesPreview").innerHTML =
    primeirosNomes.length > 0
      ? primeirosNomes.map((nome) => `<div>${nome}</div>`).join("")
      : "<div>Nenhum cliente encontrado.</div>";
}

async function atualizarVariaveisDoTextarea(textareaId, containerId) {
  console.log(1);
  const textarea = document.getElementById(textareaId);
  const container = document.getElementById(containerId);

  if (!textarea || !container) {
    console.error("Textarea ou container não encontrado.");
    return;
  }

  const regex = /{{\d+}}/g;
  const matches = textarea.value.match(regex) || [];

  const unicos = [...new Set(matches)];

  if (unicos.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = "";

  try {
    const response = await fetch("/campanha/hsm/variables", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    const opcoes = result["data"];
    let linhaAtual = null;

    unicos.forEach((variavel, index) => {
      if (index % 3 === 0) {
        linhaAtual = document.createElement("div");
        linhaAtual.className = "row mt-4";
        container.appendChild(linhaAtual);
      }

      const coluna = document.createElement("div");
      coluna.className = "col-4";

      const label = document.createElement("label");
      label.textContent = `Variável ${variavel}`;
      label.setAttribute("for", `variavel_${index}`);

      const select = document.createElement("select");
      select.id = `variavel_${index}`;
      select.name = `variaveis[${index}][campo]`;
      select.className = "form-control";

      const optionDefault = document.createElement("option");
      optionDefault.value = "";
      optionDefault.textContent = "Selecione";
      select.appendChild(optionDefault);

      opcoes.forEach(({ value, content }) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = content;
        select.appendChild(option);
      });

      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = `variaveis[${index}][token]`;
      hidden.value = variavel;

      coluna.appendChild(label);
      coluna.appendChild(select);
      coluna.appendChild(hidden);

      linhaAtual.appendChild(coluna);
    });
  } catch (error) {
    console.error("Erro ao alimentar selects de variaveis:", error);
  }
}

// Eventos
document
  .getElementById("btnConsultar")
  ?.addEventListener("click", consultarCampanha);

document.getElementById("conta")?.addEventListener("change", function () {
  const valorSelecionado = this.value;

  if (!valorSelecionado) {
    limparSelect("fluxo");
    limparSelect("hsm");
    return;
  }

  alimentarSelectsHsmEFluxoPorConta(valorSelecionado);
});

document
  .getElementById("inputContentHsm")
  ?.addEventListener("input", function () {
    atualizarVariaveisDoTextarea("inputContentHsm", "container-variaveis");
  });
