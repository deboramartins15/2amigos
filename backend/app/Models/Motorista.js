"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Motorista extends Model {
  static get table() {
    return "motoristas";
  }

  romaneio() {
    return this.belongsTo("App/Models/Romaneio", "id", "MOTORISTA");
  }
}

module.exports = Motorista;
