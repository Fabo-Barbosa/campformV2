require("../classes/Campanha");

class CampanhaMatrix extends Campanha {
  constructor(
    listaClientes = [],
    codigoConta = null,
    codigoFluxo = null,
    codigoHsm = null,
    variaveisMatrix = {},
  ) {
    this._estadoInicial = {
      listaClientes: [],
      codigoConta: null,
      codigoFluxo: null,
      codigoHsm: null,
      variaveisMatrix: {},
    };

    super(listaClientes);
    this.codigoConta = codigoConta;
    this.codigoFluxo = codigoFluxo;
    this.codigoHsm = codigoHsm;
    this.variaveisMatrix =
      variaveisMatrix && typeof variaveisMatrix === "object"
        ? { ...variaveisMatrix }
        : {};
  }

  definirCodigoConta(codigoConta) {
    this.codigoConta = codigoConta;
  }

  definirCodigoFluxo(codigoFluxo) {
    this.codigoFluxo = codigoFluxo;
  }

  definirCodigoHsm(codigoHsm) {
    this.codigoHsm = codigoHsm;
  }

  definirVariaveisMatrix(variaveisMatrix) {
    this.variaveisMatrix = variaveisMatrix;
  }

  validarCampanha() {
    if (!Array.isArray(this.listaClientes) || this.listaClientes.length === 0) {
      return {
        ok: false,
        mensagem: "A lista de clientes não pode ser vazia.",
      };
    }

    if (!this.codigoConta) {
      return {
        ok: false,
        mensagem: "O código da conta é obrigatório.",
      };
    }

    if (!this.codigoFluxo) {
      return {
        ok: false,
        mensagem: "O código do fluxo é obrigatório.",
      };
    }

    if (!this.codigoHsm) {
      return {
        ok: false,
        mensagem: "O código do HSM é obrigatório.",
      };
    }

    return {
      ok: true,
      mensagem: "Campanha válida.",
    };
  }

  toJSON() {
    return {
      lista_clientes: this.listaClientes,
      codigo_conta: this.codigoConta,
      codigo_fluxo: this.codigoFluxo,
      codigo_hsm: this.codigoHsm,
      variaveis_matrix: this.variaveisMatrix,
    };
  }

  reset() {
    this.listaClientes = [...this._estadoInicial.listaClientes];
    this.codigoConta = this._estadoInicial.codigoConta;
    this.codigoFluxo = this._estadoInicial.codigoFluxo;
    this.codigoHsm = this._estadoInicial.codigoHsm;
    this.variaveisMatrix = { ...this._estadoInicial.variaveisMatrix };
  }
}

module.exports = new CampanhaMatrix();
