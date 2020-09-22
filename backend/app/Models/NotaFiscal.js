"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class NotaFiscal extends Model {
  static get table() {
    return "nota_fiscal";
  }

  status() {
    return this.hasMany("App/Models/Status",'STATUS_ID','id');
  }
}

module.exports = NotaFiscal;
