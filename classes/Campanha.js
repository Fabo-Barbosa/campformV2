class Campanha {
  constructor(listaClientes = []) {
    if (new.target === Campanha) {
      throw new Error(
        "Campanha é uma classe abstrata e não pode ser instanciada diretamente.",
      );
    }

    this.listaClientes = Array.isArray(listaClientes) ? listaClientes : [];
  }

  adicionarCliente(cliente) {
    if (!cliente || typeof cliente !== "object") {
      throw new Error("Cliente inválido.");
    }

    this.listaClientes.push(cliente);
  }

  validarCampanha() {
    throw new Error(
      "O método validarCampanha() deve ser implementado pela classe filha.",
    );
  }

  toJSON() {
    throw new Error(
      "O método toJSON() deve ser implementado pela classe filha.",
    );
  }

  reset() {
    throw new Error(
      "O método reset() deve ser implementado pela classe filha.",
    );
  }
}

module.exports = Campanha;
