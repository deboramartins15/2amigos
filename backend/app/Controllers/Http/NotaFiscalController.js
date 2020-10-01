"use strict";

const NotaFiscal = use("App/Models/NotaFiscal");
const Status = use("App/Models/Status");
const Loja = use("App/Models/Loja");

const { getJsonFromXML } = use("App/Utils");
class NotaFiscalController {
  async index({ request, response }) {
    try {
      const CNPJ = request.header("CNPJ");

      if (CNPJ) {
        return NotaFiscal.query()
          .where("CNPJ_FAVORECIDO", "=", CNPJ)
          .with("status")
          .fetch();
      } else {
        return NotaFiscal.query()
          .with("status")
          .fetch();
      }
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async store({ request, response }) {
    try {
      const xml = request.file("file", {
        types: ["xml"],
        size: "2mb",
        extnames: ["xml"]
      });

      const userIntegracao = request.only(["login"]);
      const statusIntegracao = await Status.findBy(
        "descricao",
        "Previsao de Recebimento"
      );
      const NF = await getJsonFromXML(xml);

      if (NF.message) {
        return response.status(400).send(NF.message);
      }

      const data = {
        CNPJ_EMISSOR: NF.nfeProc.NFe.infNFe.emit.CNPJ,
        RAZAOSOCIAL_EMISSOR: NF.nfeProc.NFe.infNFe.emit.xNome,
        CNPJ_FAVORECIDO: NF.nfeProc.NFe.infNFe.dest.CNPJ,
        RAZAOSOCIAL_FAVORECIDO: NF.nfeProc.NFe.infNFe.dest.xNome,
        DT_EMISSAO: new Date(NF.nfeProc.NFe.infNFe.ide.dhEmi).toLocaleString(
          "pt-br"
        ),
        CHAVE_NF: NF.nfeProc.protNFe.infProt.chNFe,
        NUMERO_NF: NF.nfeProc.NFe.infNFe.ide.nNF,
        SERIE_NF: NF.nfeProc.NFe.infNFe.ide.serie,
        TOTAL_NF: NF.nfeProc.NFe.infNFe.total.ICMSTot.vNF,
        TOTAL_PRODUTOS: NF.nfeProc.NFe.infNFe.total.ICMSTot.vProd,
        total_frete: NF.nfeProc.NFe.infNFe.total.ICMSTot.vFrete,
        VOLUME: NF.nfeProc.NFe.infNFe.vol.qVol,
        PESO_LIQ: NF.nfeProc.NFe.infNFe.vol.pesoL,
        PESO_BRUTO: NF.nfeProc.NFe.infNFe.vol.pesoB,
        DT_INTEGRACAO: new Date().toLocaleString("pt-br"),
        USER_INTEGRACAO: userIntegracao.login,
        STATUS_ID: statusIntegracao.id
      };

      return await NotaFiscal.create(data);
    } catch (error) {
      return response.send(error);
    }
  }

  async show({ params, response }) {
    try {
      return NotaFiscal.find(params.id);
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async update({ params, request, response }) {
    try {
      const data = request.only(["status", "acao", "login"]);

      const NF = await NotaFiscal.findOrFail(params.id);
      const statusId = await Status.findBy("descricao", data.status);
      let newData = {};

      switch (data.acao.toLowerCase()) {
        case "recebimento":
          newData = {
            STATUS_ID: statusId.id,
            USER_RECEBIDO: data.login,
            DT_RECEBIDO: new Date().toLocaleString("pt-br")
          };
          break;
        case "processamento":
          newData = {
            STATUS_ID: statusId.id,
            USER_PROCESSO: data.login,
            DT_PROCESSO: new Date().toLocaleString("pt-br")
          };
          break;
        case "expedicao":
          newData = {
            STATUS_ID: statusId.id,
            USER_EXPEDICAO: data.login,
            DT_EXPEDICAO: new Date().toLocaleString("pt-br")
          };
          break;
        case "entregue":
          newData = {
            STATUS_ID: statusId.id,
            USER_ENTREGUE: data.login,
            DT_ENTREGUE: new Date().toLocaleString("pt-br")
          };
          break;
      }

      NF.merge(newData);

      await NF.save();

      return NF;
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async destroy({ params, response }) {
    try {
      const nf = await NotaFiscal.find(params.id);

      await nf.delete();
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async findByCodBarra({ params, response, request }) {
    try {
      const CNPJ = request.header("CNPJ");
      const NF = await NotaFiscal.findBy("CHAVE_NF", params.codBarra);

      if (CNPJ) {
        if (NF.CNPJ_FAVORECIDO !== CNPJ) {
          return response.status(400).send({
            error: "Nota fiscal não é visivel para a loja solicitante"
          });
        }
      }

      return NF;
    } catch (error) {
      return response.send(error);
    }
  }
}

module.exports = NotaFiscalController;
