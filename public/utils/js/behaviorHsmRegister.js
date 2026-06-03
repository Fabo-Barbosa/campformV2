document.addEventListener("DOMContentLoaded", () => {
  async function atualizarVariaveisDoTextarea(textareaId, containerId) {
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

  document
    .getElementById("inputContentHsm")
    ?.addEventListener("input", function () {
      atualizarVariaveisDoTextarea("inputContentHsm", "container-variaveis");
    });
});
