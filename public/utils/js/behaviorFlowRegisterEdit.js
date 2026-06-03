document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#formCadastroFlow");
  const container = document.querySelector("#variablesContainer");
  const hiddenVariablesInput = document.querySelector("#variablesJson");
  const headerOptionsTemplate = document.querySelector(
    "#headerOptionsTemplate",
  );

  if (!form || !container || !hiddenVariablesInput) {
    return;
  }

  document.querySelectorAll(".variable-row").forEach((row) => {
    row.querySelector(".btn-outline-danger").addEventListener("click", () => {
      row.remove();
    });
  });

  document.querySelectorAll(".select-variable-edit").forEach((s) => {
    s.innerHTML += `${headerOptionsTemplate ? headerOptionsTemplate.innerHTML : ""}`;
    const optionAtual = s.querySelector(".current-variable");
    const optionAtualValue = optionAtual.value;
    optionAtual.remove();
    s.childNodes.forEach((op) => {
      if (optionAtualValue == op.value) op.selected = true;
    });
  });

  document.querySelectorAll("[data-add-variable]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.addVariable;
      addVariableRow(type);
    });
  });

  function addVariableRow(type) {
    const row = document.createElement("div");
    row.className = "variable-row row g-2 align-items-center mb-2";
    row.dataset.variableRow = "true";

    const keyColumn = document.createElement("div");
    keyColumn.className = "col-md-5";

    const valueColumn = document.createElement("div");
    valueColumn.className = "col-md-5";

    const actionColumn = document.createElement("div");
    actionColumn.className = "col-md-2 d-grid";

    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.className = "form-control";
    keyInput.placeholder = "Nome da variável";
    keyInput.dataset.variableKey = "true";

    keyColumn.appendChild(keyInput);

    if (type === "text") {
      const valueInput = document.createElement("input");
      valueInput.type = "text";
      valueInput.className = "form-control";
      valueInput.placeholder = "Valor da variável";
      valueInput.dataset.variableValue = "true";

      valueColumn.appendChild(valueInput);
    }

    if (type === "header") {
      const select = document.createElement("select");
      select.className = "form-control";
      select.dataset.variableValue = "true";

      select.innerHTML = `
        <option value="">Selecione uma coluna</option>
        ${headerOptionsTemplate ? headerOptionsTemplate.innerHTML : ""}
      `;

      valueColumn.appendChild(select);
    }

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-outline-danger";
    removeButton.textContent = "Remover";

    removeButton.addEventListener("click", () => {
      row.remove();
    });

    actionColumn.appendChild(removeButton);

    row.appendChild(keyColumn);
    row.appendChild(valueColumn);
    row.appendChild(actionColumn);

    container.appendChild(row);
  }

  form.addEventListener("submit", (event) => {
    const variables = {};
    const usedKeys = new Set();

    const rows = container.querySelectorAll("[data-variable-row]");

    for (const row of rows) {
      const keyInput = row.querySelector("[data-variable-key]");
      const valueInput = row.querySelector("[data-variable-value]");

      const key = keyInput.value.trim();
      const value = valueInput.value.trim();

      if (!key && !value) {
        continue;
      }

      if (!key) {
        event.preventDefault();
        alert("Informe o nome da variável.");
        keyInput.focus();
        return false;
      }

      if (!value) {
        event.preventDefault();
        alert(`Informe o valor da variável "${key}".`);
        valueInput.focus();
        return false;
      }

      if (usedKeys.has(key)) {
        event.preventDefault();
        alert(`A variavel "${key}" foi informada mais de uma vez.`);
        keyInput.focus();
        return false;
      }

      usedKeys.add(key);
      variables[key] = value;
    }

    hiddenVariablesInput.value = JSON.stringify(variables);
  });
});
