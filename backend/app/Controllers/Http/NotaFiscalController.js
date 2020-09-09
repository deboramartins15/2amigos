'use strict'

const NotaFiscal = use("App/Models/NotaFiscal")


const { getJsonFromXML } = use("App/Utils");


class NotaFiscalController {
 
  async index ({ response }) {
    try {
      return NotaFiscal.all();
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async store ({ request, response }) {
    try {
      const xml = request.file("file", {
        types: ["xml"],
        size: "2mb",
      });
      
      const NF = await getJsonFromXML(xml)
      
      const data = {

      }
  
      return await NotaFiscal.create(data);
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async show ({ params, response }) {
    try {
      return NotaFiscal.find(params.id);
    } catch (error) {
      return response.status(error.status).send(error);
    }    
  }

  async update ({ params, request, response }) {
  }

  async destroy ({ params, response }) {
    try {
      const nf = await NotaFiscal.find(params.id)

      await nf.delete()
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }
}

module.exports = NotaFiscalController
