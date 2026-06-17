const Campanha = require("../classes/Campanha");

class CampanhaDiscador extends Campanha {
  constructor(listaClientes = [], idsCampanha = [], nome) {
    super(listaClientes);
    this._estadoInicial = {
      listaClientes: [],
      idsCampanha: [],
      nome: null,
    };

    this.idsCampanha = idsCampanha;
    this.nome = nome;
  }

  definirCampanhas(ids) {
    this.idsCampanha = ids;
  }

  definirNome(nome) {
    this.nome = nome;
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

    if (!Array.isArray(this.idsCampanha) || this.idsCampanha.length === 0) {
      return {
        ok: false,
        mensagem: "O ID da campanha é obrigatório.",
      };
    }

    if (!this.nome) {
      return {
        ok: false,
        mensagem: "O nome é obrigatório.",
      };
    }
  }

  toJSON() {
    return {
      lista_clientes: this.listaClientes,
      idsCampanha: this.idsCampanha,
      nome: this.nome,
    };
  }

  reset() {
    this.listaClientes = [...this._estadoInicial.listaClientes];
    this.idsCampanha = this._estadoInicial.idsCampanha;
    this.nome = this._estadoInicial.nome;
  }
}

module.exports = CampanhaDiscador;
