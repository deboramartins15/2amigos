"use strict";

const TipoVeiculo = use("App/Models/TipoVeiculo");

class TipoVeiculoController {
  async index({ response }) {
    try {
      return await TipoVeiculo.all();
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async show({ params, response }) {
    try {
      return await TipoVeiculo.find(params.id);
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }
}

module.exports = TipoVeiculoController;
