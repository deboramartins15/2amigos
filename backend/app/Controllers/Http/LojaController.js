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
      const data = request.only(["login", "senha", "CNPJ", "matriz"]);

      const lojaExists = await Loja.findBy("login", data.login);

      if (lojaExists) {
        return response
          .status(400)
          .send({ message: { error: "Loja já cadastrada" } });
      }

      const loja = await Loja.create(data);

      return loja;
    } catch (error) {
      return response.send(error);
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

    const data = request.only(["matriz"]);

    loja.merge(data);

    await loja.save();

    return loja;
  }
}

module.exports = LojaController;
