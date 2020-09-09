'use strict'

/*
|--------------------------------------------------------------------------
| StatusInsertSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Status = use("App/Models/Status");

class StatusInsertSeeder {
  async run () {
    await Status.create({descricao: 'Previsao de Recebimento'})
    await Status.create({descricao: 'Recebida'})
    await Status.create({descricao: 'Em Processo'})
    await Status.create({descricao: 'Expedido'})
    await Status.create({descricao: 'Entregue'})
  }
}

module.exports = StatusInsertSeeder
