require("dotenv").config();

class MatrixServices {
  static async authUserToken() {
    const response = await fetch(process.env.URL_MTRX, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: {
        login: process.env.LOGIN_MTRX,
        chave: process.env.CHAVE_MTRX,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro de autenticação. Status: ${response.status}`);
    }

    const responseJson = response.json();
    process.env.TOKEN_MTRX = responseJson["result"]["token"];
    return true;
  }

  // Em Desenvolvimento +++++++++++++++++++
  static async enviarCampanhaHsm(campanha) {
    if (!(campanha instanceof Campanha)) {
      throw new Error(
        "O parâmetro enviado deve ser uma instância de Campanha.",
      );
    }

    const validacao = campanha.validarCampanha();

    if (!validacao.ok) {
      throw new Error(validacao.mensagem);
    }

    const formatApiJson = (index) => {};

    const response = await fetch("/api/campanhas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(campanha.toJSON()),
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar campanha. Status: ${response.status}`);
    }

    return await response.json();
  }
}

export default AutoFillService;
