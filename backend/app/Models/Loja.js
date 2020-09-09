"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");
const Hash = use('Hash')

class Loja extends Model {
  static boot() {
    super.boot();

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook("beforeSave", async (lojaInstance) => {
      if (lojaInstance.dirty.senha) {
        lojaInstance.senha = await Hash.make(lojaInstance.senha);
      }
    });
  }
}

module.exports = Loja;
