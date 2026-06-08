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
    removeButton.textContent = "Remover";

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
});
