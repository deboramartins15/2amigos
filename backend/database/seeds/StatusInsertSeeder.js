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
    await Status.findOrCreate({descricao: 'Previsao de Recebimento'})
    await Status.findOrCreate({descricao: 'Recebida'})
    await Status.findOrCreate({descricao: 'Em Processo'})
    await Status.findOrCreate({descricao: 'Expedido'})
    await Status.findOrCreate({descricao: 'Entregue'})
    await Status.findOrCreate({descricao: 'Pendente'})
    await Status.findOrCreate({descricao: 'Conferido'})
    await Status.findOrCreate({descricao: 'Embarcado'})
  }
}

module.exports = StatusInsertSeeder
