document.addEventListener("DOMContentLoaded", async () => {
  // Lógica de alimentação de selects de variáveis na área de editar um hsm
  // ######################################################################
  const selectVariables = document.getElementsByClassName("variable_select");
  if (selectVariables.length > 0) {
    try {
      const response = await fetch("/campanha/hsm/variables", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      const opcoes = result["data"];

      Array.from(selectVariables).forEach((s) => {
        const childInput = s.querySelector(".variable_input");
        opcoes.forEach((op) => {
          if (op["value"] == childInput.value) {
            childInput.textContent = op["content"];
            return;
          }
          const newOption = document.createElement("option");
          newOption.setAttribute("value", op["value"]);
          newOption.textContent = op["content"];

          s.appendChild(newOption);
        });
      });
    } catch (error) {
      console.error("Erro ao alimentar selects de variaveis:", error);
    }
  }
});
