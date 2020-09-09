"use strict";

const Loja = use("App/Models/Loja");

class SessionController {
  async create({ request, auth }) {
    const { login, senha } = request.all();

    const token = await auth.attempt(login, senha);

    const { id } = await Loja.findBy("login", login);

    return { token, lojaId: id };
  }
}

module.exports = SessionController;
