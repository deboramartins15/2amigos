'use strict'

/*
|--------------------------------------------------------------------------
| TipoVeiculoInsertSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const TipoVeiculo = use("App/Models/TipoVeiculo")

class TipoVeiculoInsertSeeder {
  async run () {
    await TipoVeiculo.findOrCreate({tipo: 'Vuc'})
    await TipoVeiculo.findOrCreate({tipo: '3/4'})
    await TipoVeiculo.findOrCreate({tipo: 'Toco'})
    await TipoVeiculo.findOrCreate({tipo: 'Truck'})
    await TipoVeiculo.findOrCreate({tipo: 'Carreta'})
  }
}

module.exports = TipoVeiculoInsertSeeder
