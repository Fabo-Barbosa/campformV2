class Cliente {
  static headerFields = Object.freeze([
    Object.freeze({ value: "codigo", content: "Codigo do cliente no RBX" }),
    Object.freeze({ value: "nome", content: "Nome do cliente no RBX" }),
    Object.freeze({ value: "cnpj_cnpf", content: "CPF ou CNPJ do cliente" }),
  ]);

  constructor(
    codigo = null,
    nome = null,
    cnpj_cnpf = null,
    email = null,
    telCelular = null,
    uf = null,
    cidade = null,
    bairro = null,
    endereco = null,
    cep = null,
    numero = null,
    complemento = null,
  ) {
    this._estadoInicial = {
      codigo: null,
      nome: null,
      cnpj_cnpf: null,
      email: null,
      telCelular: null,
      endereco: {},
    };

    this.codigo = codigo;
    this.nome = nome;
    this.cnpj_cnpf = cnpj_cnpf;
    this.email = email;
    this.telCelular = telCelular;
    this.endereco = {
      uf: uf,
      localidade: cidade,
      bairro: bairro,
      logradouro: endereco,
      cep: cep,
      numero: numero,
      complemento: complemento,
    };
  }

  toJSON() {
    return {
      nome: this.nome,
      cpfCnpj: this.cnpj_cnpf,
      email: this.email,
      telefone: this.telCelular,
      endereco: this.endereco,
    };
  }
}

module.exports = Cliente;
