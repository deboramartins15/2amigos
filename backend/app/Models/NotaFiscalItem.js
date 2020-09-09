"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class NotaFiscalItem extends Model {
  nota_fiscal() {
    return this.belongsTo("App/Models/NotaFiscal");
  }
}

module.exports = NotaFiscalItem;
