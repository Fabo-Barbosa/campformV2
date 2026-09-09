const Campanha = require("../classes/Campanha");

class CampanhaMatrix extends Campanha {
  static TYPE = Object.freeze([
    Object.freeze({ name: "Notificação", cod: 2 }),
    Object.freeze({ name: "Direcionado a um flow", cod: 1 }),
  ]);

  constructor(
    listaClientes = [],
    conta = null,
    fluxo = null,
    hsm = null,
    forca = false,
    tipo = null,
    agendamentos = [],
  ) {
    super(listaClientes);
    this._estadoInicial = {
      listaClientes: [],
      conta: null,
      fluxo: null,
      hsm: null,
      forca: false,
      tipo: null,
      agendamentos: [],
    };

    this.conta = conta;
    this.fluxo = fluxo;
    this.hsm = hsm;
    this.forca = forca;
    this.numTipo = tipo;
    this.agendamentos = agendamentos;
  }

  definirConta(conta) {
    this.conta = conta;
  }

  definirFluxo(fluxo) {
    this.fluxo = fluxo;
  }

  definirHsm(hsm) {
    this.hsm = hsm;
  }

  definirAgendamnetos(agendamentos) {
    this.agendamentos = agendamentos;
  }

  forcarEnvio() {
    this.forca = true;
  }

  naoForcarEnvio() {
    this.forca = false;
  }

  definirTipoDeEnvio(tipo) {
    this.numTipo = tipo;
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

    if (!this.conta) {
      return {
        ok: false,
        mensagem: "O código da conta é obrigatório.",
      };
    }

    if (!this.fluxo) {
      return {
        ok: false,
        mensagem: "O código do fluxo é obrigatório.",
      };
    }

    if (!this.hsm) {
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
      conta: this.conta,
      fluxo: this.fluxo,
      hsm: this.hsm,
      tipoEnvio: this.numTipo,
      forca: this.forca,
      agendamentos: this.agendamentos,
    };
  }

  reset() {
    this.listaClientes = [...this._estadoInicial.listaClientes];
    this.conta = this._estadoInicial.codigoConta;
    this.fluxo = this._estadoInicial.codigoFluxo;
    this.hsm = this._estadoInicial.codigoHsm;
    this.numTipo = this._estadoInicial.tipo;
    this.forca = this._estadoInicial.forca;
    this.agendamentos = this._estadoInicial.agendamentos;
  }
}

module.exports = CampanhaMatrix;
