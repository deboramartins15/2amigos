"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Romaneio extends Model {
  static get table() {
    return "romaneios";
  }

  status() {
    return this.hasMany("App/Models/Status", "STATUS_ID", "id");
  }

  nota_fiscal() {
    return this.hasMany("App/Models/NotaFiscal", "id", "ROMANEIO_ID");
  }

  veiculo(){
    return this.hasOne("App/Models/TipoVeiculo", "id", "VEICULO")
  }

  motorista(){
    return this.hasOne("App/Models/Motorista", "MOTORISTA", "id")
  }
}

module.exports = Romaneio;
