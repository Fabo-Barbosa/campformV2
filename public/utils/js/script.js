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

// Função exibir modal para confiramar exclusão de item ou cancelar uma operação
document.addEventListener("DOMContentLoaded", () => {
  const deleteForm = document.getElementById("deleteConfirmForm");
  const deleteText = document.getElementById("deleteConfirmText");

  const cancelForm = document.getElementById("cancelConfirmForm");
  const cancelText = document.getElementById("cancelConfirmText");

  document.querySelectorAll(".js-open-delete-modal").forEach((button) => {
    button.addEventListener("click", () => {
      const deleteUrl = button.dataset.deleteUrl;
      const itemName = button.dataset.itemName || "este item";
      const itemType = button.dataset.itemType || "registro";

      deleteForm.action = deleteUrl;
      deleteText.textContent = `Tem certeza que deseja excluir o ${itemType} "${itemName}"?`;
    });
  });

  document.querySelectorAll(".js-open-cancel-modal").forEach((button) => {
    button.addEventListener("click", () => {
      const cancelUrl = button.dataset.cancelUrl;
      const itemType = button.dataset.itemType || "esta execução";

      cancelForm.action = cancelUrl;
      cancelText.textContent = `Tem certeza que deseja cancelar ${itemType}?`;
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
function limparSelect(idElemento, optionText = "") {
  const select = document.getElementById(idElemento);

  if (!select) {
    console.error(`Select com id "${idElemento}" não encontrado.`);
    return;
  }
  select.innerHTML = "";
  if (optionText !== "") {
    select.innerHTML = `<option value="">${optionText}</option>`;
  }
}

// cria uma lista value: v content: c para alimentar selects
function mapearParaListaPadrao(lista, valueKey = "cod", contentKey = "name") {
  if (!Array.isArray(lista)) return [];

  return lista.map((item) => ({
    value: item[valueKey],
    content: item[contentKey],
  }));
}

// Lógica de agendamento
function obterDateTimeLocalMinimo() {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  return agora.toISOString().slice(0, 16);
}

function validarDataHoraFutura(input) {
  if (!input || !input.value) {
    input.setCustomValidity("Informe uma data e hora.");
    return false;
  }

  const dataSelecionada = new Date(input.value);
  const agora = new Date();

  if (Number.isNaN(dataSelecionada.getTime())) {
    input.setCustomValidity("Informe uma data e hora válida.");
    return false;
  }

  if (dataSelecionada <= agora) {
    input.setCustomValidity("A data e hora devem ser futuras.");
    return false;
  }

  input.setCustomValidity("");
  return true;
}
