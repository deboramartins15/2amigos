"use strict";

const Motorista = use("App/Models/Motorista");

class MotoristaController {
  async index({ response }) {
    try {
      return await Motorista.all();
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async store({ request, response }) {
    try {
      const data = request.only(["nome", "documento"]);

      const motoristaExists = await Motorista.findBy(
        "DOCUMENTO",
        data.documento
      );

      if (motoristaExists) {
        return response.status(400).send({ error: "Motorista já cadastrado" });
      }

      const motorista = await Motorista.create({NOME: data.nome, DOCUMENTO: data.documento});

      return motorista;
    } catch (error) {
      return response.status(400).send(error);
    }
  }

  async show({ params, response }) {
    try {
      return await Motorista.find(params.id);
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async update({ params, request, response }) {
    try {
      const motorista = await Motorista.findOrFail(params.id);

      const data = request.only(["nome", "documento"]);

      const documentoExists = await Motorista.findBy(
        "DOCUMENTO",
        data.documento
      );
      if (documentoExists) {
        return response.status(400).send({ error: "Motorista já cadastrado" });
      }

      motorista.merge({NOME: data.nome, DOCUMENTO: data.documento});
      await motorista.save();

      return motorista;
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async destroy({ params, response }) {
    try {
      const motorista = await Motorista.find(params.id);

      await motorista.delete();
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }
}

module.exports = MotoristaController;
