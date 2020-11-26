"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class TipoVeiculo extends Model {
  static get table() {
    return "tipo_veiculos";
  }

  romaneio() {
    return this.belongsTo("App/Models/Romaneio", "id", "VEICULO");
  }
}

module.exports = TipoVeiculo;
