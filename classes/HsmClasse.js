class HsmClasse {
  static VARIABLE_FIELDS = [
    Object.freeze({ value: "nome", content: "Nome do cliente" }),
    Object.freeze({ value: "telefone", content: "Telefone do cliente" }),
    Object.freeze({ value: "cidade", content: "Cidade do cliente" }),
  ];

  static CATEGORIES = Object.freeze({
    MARKETING: { name: "Marketing", price: 2 },
    UTILITY: { name: "Utility", price: 1 },
    AUTHENTICATION: { name: "Authentication", price: 1 },
  });

  constructor({
    codigo = null,
    nome = "",
    conteudo = "",
    categoria = null,
    variaveis = [],
  } = {}) {
    this.codigo = codigo;
    this.nome = nome;
    this.conteudo = conteudo;
    this.categoria = categoria;
    this.variaveis = Array.isArray(variaveis) ? variaveis : [];
  }

  adicionarVariavel(variavel) {
    this.variaveis.push(variavel);
  }

  definirCategoria(categoria) {
    const categoriasValidas = Object.values(Hsm.CATEGORIES);

    if (!categoriasValidas.includes(categoria)) {
      throw new Error("Categoria inválida.");
    }

    this.categoria = categoria;
  }

  validar() {
    const erros = [];

    if (!this.codigo) {
      erros.push("O código é obrigatório.");
    }

    if (!this.nome) {
      erros.push("O nome é obrigatório.");
    }

    if (!this.conteudo) {
      erros.push("O conteúdo é obrigatório.");
    }

    if (!this.categoria) {
      erros.push("A categoria é obrigatória.");
    }

    if (
      this.categoria &&
      !Object.values(Hsm.CATEGORIES).includes(this.categoria)
    ) {
      erros.push("A categoria informada é inválida.");
    }

    return {
      ok: erros.length === 0,
      erros,
    };
  }

  toJSON() {
    return {
      codigo: this.codigo,
      nome: this.nome,
      conteudo: this.conteudo,
      categoria: this.categoria,
      variaveis: this.variaveis,
    };
  }
}

module.exports = HsmClasse;
