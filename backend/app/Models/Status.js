'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Status extends Model {
    static get table(){
        return 'status'
    }

    nota_fiscal(){
        return this.belongsTo("App/Models/NotaFiscal",'STATUS_ID','id')
    }
}

module.exports = Status
