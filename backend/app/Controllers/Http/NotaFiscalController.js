"use strict";

const NotaFiscal = use("App/Models/NotaFiscal");
const Status = use("App/Models/Status");
const Loja = use("App/Models/Loja");

const json2xls = require("json2xls");
const fs = require("fs");
const path = require("path");

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
        TOTAL_FRETE: NF.nfeProc.NFe.infNFe.total.ICMSTot.vFrete,
        VOLUME: NF.nfeProc.NFe.infNFe.transp.vol.qVol,
        PESO_LIQ: NF.nfeProc.NFe.infNFe.transp.vol.pesoL,
        PESO_BRUTO: NF.nfeProc.NFe.infNFe.transp.vol.pesoB,
        DT_INTEGRACAO: new Date().toLocaleString("pt-br"),
        USER_INTEGRACAO: userIntegracao.login,
        STATUS_ID: statusIntegracao.id
      };

      const exists = await NotaFiscal.findBy("CHAVE_NF", data.CHAVE_NF);

      if (exists)
        return response
          .status(400)
          .send({ error: "Nota fiscal já integrada!" });

      return await NotaFiscal.create(data);
    } catch (error) {
      return response.status(500).send(error.message);
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
      const data = request.only(["status", "acao", "login", "romaneioEntrada"]);

      const NF = await NotaFiscal.findOrFail(params.id);
      const statusId = await Status.findBy("descricao", data.status);
      let newData = {};

      switch (data.acao.toLowerCase()) {
        case "recebimento":
          newData = {
            STATUS_ID: statusId.id,
            USER_RECEBIDO: data.login,
            DT_RECEBIDO: new Date().toLocaleString("pt-br"),
            ROMANEIO_ID: data.romaneioEntrada
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
        case "entrega":
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

  async findByCodBarra({ params, response }) {
    try {
      if (!params.codBarra) {
        return response
          .status(400)
          .send({ error: "Informe o código de barra!" });
      }

      const nf = await NotaFiscal.query()
        .where("CHAVE_NF", "=", params.codBarra)
        .with("status")
        .fetch();

      if (nf.toJSON().length === 0) {
        return response
          .status(400)
          .send({ error: "Nota fiscal não importada!" });
      }

      return nf;
    } catch (error) {
      return response.status(500).send(error);
    }
  }

  async exportToCSV({ request, response }) {
    try {
      const nfs = request.only(["data"]);

      nfs.data.map(nf => {
        nf.status_desc = nf.status[0].descricao;

        if (nf.status[0].descricao === "Recebida")
          nf.status_desc = "CD 2 Amigos";

        if (nf.status[0].descricao === "Expedido")
          nf.status_desc = "Saiu para entrega";

        return nf.status_desc;
      });

      const fields = [
        "CNPJ_EMISSOR",
        "RAZAOSOCIAL_EMISSOR",
        "CNPJ_FAVORECIDO",
        "RAZAOSOCIAL_FAVORECIDO",
        "DT_EMISSAO",
        "CHAVE_NF",
        "NUMERO_NF",
        "SERIE_NF",
        "TOTAL_NF",
        "TOTAL_PRODUTOS",
        "TOTAL_FRETE",
        "VOLUME",
        "PESO_LIQ",
        "PESO_BRUTO",
        "DT_INTEGRACAO",
        "USER_INTEGRACAO",
        "DT_PROCESSO",
        "USER_PROCESSO",
        "status_desc"
      ];
      const opts = { fields };

      if (nfs) {
        const xls = json2xls(nfs.data, opts);
        const filename = `2amigos-notasfiscais.xlsx`;

        if (xls) {
          fs.writeFileSync(
            path.join(__dirname, "..", "..", "..", "tmp", "exports", filename),
            xls,
            "binary",
            function(err) {
              if (err) throw err;
            }
          );
          return response.status(200).send();
        }

        return response.status(400).send({ message: "Erro ao exportar dados" });
      }
    } catch (error) {
      return response.status(500).send(error.message);
    }
  }

  async deleteCSV({ params, response }) {
    try {
      if (!params.filename)
        return response
          .status(400)
          .send({ message: "informe o nome do arquivo" });

      const filename = params.filename;
      fs.unlinkSync(
        path.join(__dirname, "..", "..", "..", "tmp", "exports", filename)
      );

      return response.status(204).send();
    } catch (error) {
      return response.status(500).send(error.message);
    }
  }
}

module.exports = NotaFiscalController;
