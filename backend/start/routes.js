'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: '2amigos API' }
})

Route.post("/signup", "LojaController.store");
Route.post("/login", "SessionController.create");

Route.resource("loja", "LojaController").apiOnly().middleware("auth");
Route.resource("nf", "NotaFiscalController").apiOnly().middleware("auth");
