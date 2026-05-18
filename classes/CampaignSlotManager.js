const Campanha = require("./CampanhaMatrix");

class CampaignSlotManager {
  constructor({
    limitePosicoes = 10,
    tempoExpiracaoMs = 30 * 60 * 1000, // 30 minutos
  } = {}) {
    this.limitePosicoes = limitePosicoes;
    this.tempoExpiracaoMs = tempoExpiracaoMs;

    this.posicoes = Array.from({ length: limitePosicoes }, (_, index) => ({
      chave: `c${index}`,
      campanha: new Campanha(),
      usuarioId: null,
      createdAt: null,
      updatedAt: null,
      locked: false,
    }));
  }

  _agora() {
    return Date.now();
  }

  _estaExpirada(posicao) {
    if (!posicao.updatedAt) return false;
    return this._agora() - posicao.updatedAt > this.tempoExpiracaoMs;
  }

  _resetPosicao(posicao) {
    posicao.campanha.reset();
    posicao.usuarioId = null;
    posicao.createdAt = null;
    posicao.updatedAt = null;
    posicao.locked = false;
  }

  limparExpiradas() {
    for (const posicao of this.posicoes) {
      if (posicao.usuarioId && this._estaExpirada(posicao)) {
        this._resetPosicao(posicao);
      }
    }
  }

  obterPosicaoDoUsuario(usuarioId) {
    this.limparExpiradas();

    return (
      this.posicoes.find((posicao) => posicao.usuarioId === usuarioId) || null
    );
  }

  obterPosicaoLivre() {
    this.limparExpiradas();

    return (
      this.posicoes.find(
        (posicao) => posicao.usuarioId === null && !posicao.locked,
      ) || null
    );
  }

  ocuparPosicao(usuarioId) {
    if (!usuarioId) {
      throw new Error("usuarioId é obrigatório.");
    }

    this.limparExpiradas();

    const posicaoExistente = this.obterPosicaoDoUsuario(usuarioId);
    if (posicaoExistente) {
      posicaoExistente.updatedAt = this._agora();
      return {
        chave: posicaoExistente.chave,
        reutilizada: true,
        campanha: posicaoExistente.campanha,
      };
    }

    const posicaoLivre = this.obterPosicaoLivre();

    if (!posicaoLivre) {
      return null;
    }

    posicaoLivre.usuarioId = usuarioId;
    posicaoLivre.createdAt = this._agora();
    posicaoLivre.updatedAt = this._agora();
    posicaoLivre.campanha.reset();

    return {
      chave: posicaoLivre.chave,
      reutilizada: false,
      campanha: posicaoLivre.campanha,
    };
  }

  // atualizarCampanha(chave, dadosCampanha) {
  //   const posicao = this.posicoes.find((p) => p.chave === chave);

  //   if (!posicao) {
  //     throw new Error("Posição não encontrada.");
  //   }

  //   if (!posicao.usuarioId) {
  //     throw new Error("Posição não está ocupada.");
  //   }

  //   posicao.campanha = {
  //     ...(posicao.campanha || {}),
  //     ...dadosCampanha,
  //   };
  //   posicao.updatedAt = this._agora();

  //   return posicao;
  // }

  obterCampanha(chave) {
    const posicao = this.posicoes.find((p) => p.chave === chave);

    if (!posicao) {
      throw new Error("Posição não encontrada.");
    }

    if (posicao.usuarioId && this._estaExpirada(posicao)) {
      this._resetPosicao(posicao);
      return null;
    }

    return posicao.campanha;
  }

  liberarPosicao(chave) {
    const posicao = this.posicoes.find((p) => p.chave === chave);

    if (!posicao) {
      throw new Error("Posição não encontrada.");
    }

    this._resetPosicao(posicao);

    return true;
  }

  enviarCampanha(chave) {
    const posicao = this.posicoes.find((p) => p.chave === chave);

    if (!posicao) {
      throw new Error("Posição não encontrada.");
    }

    if (!posicao.usuarioId) {
      throw new Error("Posição não está ocupada.");
    }

    const campanhaEnviada = posicao.campanha;

    this._resetPosicao(posicao);

    return campanhaEnviada;
  }

  todasPosicoesOcupadas() {
    this.limparExpiradas();

    return this.posicoes.every(
      (posicao) => posicao.usuarioId !== null || posicao.locked,
    );
  }

  listarStatus() {
    this.limparExpiradas();

    return this.posicoes.map((posicao) => ({
      chave: posicao.chave,
      ocupada: !!posicao.usuarioId,
      usuarioId: posicao.usuarioId,
      createdAt: posicao.createdAt,
      updatedAt: posicao.updatedAt,
      expirada: posicao.usuarioId ? this._estaExpirada(posicao) : false,
    }));
  }
}

module.exports = new CampaignSlotManager();
