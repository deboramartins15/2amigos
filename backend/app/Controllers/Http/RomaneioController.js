"use strict";

const Mail = use("Mail");

const NotaFiscal = use("App/Models/NotaFiscal");
const Romaneio = use("App/Models/Romaneio");
const Status = use("App/Models/Status");

class RomaneioController {
  async index({ response }) {
    try {
      return Romaneio.query()
        .with("nota_fiscal")
        .with("status")
        .fetch();
    } catch (error) {
      return response.status(500).send(error.message);
    }
  }

  async show({ params, response }) {
    try {
      if (!params.id)
        return response.status(400).send({ error: "Informe o romaneio" });

      const romaneio = await Romaneio.query()
        .where("id", "=", params.id)
        .with("nota_fiscal.status")
        .with("status")
        .fetch();

      return romaneio;
    } catch (error) {
      return response.status(500).send(error.message);
    }
  }

  async store({ request, response }) {
    try {
      const dataRequest = request.only([
        "nfs",
        "placa",
        "docMotorista",
        "login"
      ]);

      const statusPendente = await Status.findBy("descricao", "Pendente");

      const data = {
        PLACAVEICULO: dataRequest.placa,
        DOCMOTORISTA: dataRequest.docMotorista,
        USER_CRIACAO: dataRequest.login,
        STATUS_ID: statusPendente.id
      };

      const romaneio = await Romaneio.create(data);

      dataRequest.nfs.map(async nf => {
        const NF = await NotaFiscal.findBy("CHAVE_NF", nf.CHAVE_NF);
        NF.merge({ ROMANEIO_ID: romaneio.id });
        NF.save();
      });

      return response.status(200).send(romaneio);
    } catch (error) {
      return response.status(500).send(error.message);
    }
  }

  async update({ request, response, params }) {
    try {
      const data = request.only([
        "status",
        "acao",
        "login",
        "placa",
        "docMotorista",
        "nfs"
      ]);

      const romaneio = await Romaneio.findOrFail(params.id);
      let newData = {};

      if (
        data.acao.toLowerCase() === "conferir" ||
        data.acao.toLowerCase() === "expedicao"
      ) {
        const statusId = await Status.findBy("descricao", data.status);

        switch (data.acao.toLowerCase()) {
          case "conferir":
            newData = {
              STATUS_ID: statusId.id,
              USER_CONFERIDO: data.login,
              DT_CONFERIDO: new Date().toLocaleString("pt-br"),
              PLACAVEICULO: data.placa,
              DOCMOTORISTA: data.docMotorista
            };
            break;
          case "expedicao":
            newData = {
              STATUS_ID: statusId.id,
              USER_EMBARQUE: data.login,
              DT_EMBARQUE: new Date().toLocaleString("pt-br")
            };
            break;
        }
      } else {
        newData = {
          PLACAVEICULO: data.placa,
          DOCMOTORISTA: data.docMotorista
        };

        if (data.nfs) {
          data.nfs.map(async nf => {
            const NF = await NotaFiscal.findBy("CHAVE_NF", nf.CHAVE_NF);
            NF.merge({ ROMANEIO_ID: romaneio.id });
            NF.save();
          });
        }
      }

      romaneio.merge(newData);

      await romaneio.save();

      if (data.acao.toLowerCase() === "expedicao") {
        await Mail.send("welcome", romaneio.toJSON(), (message) => {
          message
            .to("debora.martins@abracadabra.com.br")
            .from("2amigostransportadora@gmail.com")
            .subject("Welcome to yardstick");
        });
      }

      return romaneio;
    } catch (error) {
      console.log(error)
      return response.status(error.status).send(error);
    }
  }

  async confereRomaneio({ params, response }) {
    try {
      if (!params.codBarra)
        return response.status(400).send({ error: "Informe a nota fiscal" });

      const NF = await NotaFiscal.findBy("CHAVE_NF", params.codBarra);

      if (!NF)
        return response.status(400).send({ error: "Nota fiscal não existe" });

      if (NF.ROMANEIO_ID != params.id)
        return response
          .status(400)
          .send({ error: "Nota fiscal não pertence ao romaneio" });

      return response
        .status(200)
        .send({ message: "Nota fiscal conferida com sucesso" });
    } catch (error) {
      return response.status(500).send(error.message);
    }
  }
}

module.exports = RomaneioController;
