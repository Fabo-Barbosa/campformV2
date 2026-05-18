const Campanha = require("../classes/Campanha");

class CampanhaMatrix extends Campanha {
  static TYPE = Object.freeze([
    Object.freeze({ name: "Notificação", cod: 2 }),
    Object.freeze({ name: "Direcionado a um flow", cod: 1 }),
  ]);

  constructor(
    listaClientes = [],
    codigoConta = null,
    codigoFluxo = null,
    codigoHsm = null,
    tipo = null,
  ) {
    super(listaClientes);
    this._estadoInicial = {
      listaClientes: [],
      codigoConta: null,
      codigoFluxo: null,
      codigoHsm: null,
      tipo: null,
    };

    this.codigoConta = codigoConta;
    this.codigoFluxo = codigoFluxo;
    this.codigoHsm = codigoHsm;
    this.tipo = tipo;
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

  quantidadeClientes() {
    return this.listaClientes.length;
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
    };
  }

  reset() {
    this.listaClientes = [...this._estadoInicial.listaClientes];
    this.codigoConta = this._estadoInicial.codigoConta;
    this.codigoFluxo = this._estadoInicial.codigoFluxo;
    this.codigoHsm = this._estadoInicial.codigoHsm;
    this.tipo = this._estadoInicial.tipo;
  }
}

module.exports = CampanhaMatrix;
