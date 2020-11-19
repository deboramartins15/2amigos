"use strict";

const Loja = use("App/Models/Loja");

class LojaController {
  async index({ response }) {
    try {
      return await Loja.all();
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async store({ request, response }) {
    try {
      const data = request.only([
        "login",
        "senha",
        "CNPJ",
        "matriz",
        "transportadora"
      ]);

      const lojaExists = await Loja.findBy("login", data.login);

      if (lojaExists) {
        return response.status(400).send({ error: "Loja já cadastrada" });
      }

      const loja = await Loja.create(data);

      return loja;
    } catch (error) {
      return response.status(400).send(error);
    }
  }

  async show({ params, response }) {
    try {
      return await Loja.find(params.id);
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async update({ params, request }) {
    const loja = await Loja.findOrFail(params.id);

    const data = request.only(["matriz", "transportadora"]);

    loja.merge(data);

    await loja.save();

    return loja;
  }

  async destroy({ params, response }) {
    try {
      const loja = await Loja.find(params.id);

      await loja.delete();
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }
}

module.exports = LojaController;
