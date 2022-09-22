"use strict";

const Mail = use("Mail");

const NotaFiscal = use("App/Models/NotaFiscal");
const Romaneio = use("App/Models/Romaneio");
const Status = use("App/Models/Status");
const Motorista = use("App/Models/Motorista");
const Loja = use("App/Models/Loja");
const TipoVeiculo = use("App/Models/TipoVeiculo");

const json2xls = require("json2xls");
const fs = require("fs");
const path = require("path");

const {
  geraInfoManifestoConsolidado,
  geraInfoManifestoDestinatario,
  criaPDFConsolidado,
  criaPDFDestinatarios
} = use("App/Utils");

class RomaneioController {
  async index({ response }) {
    try {
      return Romaneio.query()
        .with("nota_fiscal")
        .with("status")
        .with("motorista")
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
        .with("motorista")
        .fetch();

      const romaneioJSON = romaneio.toJSON();

      if (romaneioJSON[0].ROMANEIOENTRADA) {
        const nfs = await NotaFiscal.query()
          .where("ROMANEIOENTRADA_ID", "=", romaneioJSON[0].id)
          .with("status")
          .fetch();

        romaneioJSON[0].nota_fiscal = nfs;
      }

      return romaneioJSON;
    } catch (error) {
      return response.status(500).send(error.message);
    }
  }

  async store({ request, response }) {
    try {
      const dataRequest = request.only([
        "nfs",
        "placa",
        "motorista",
        "veiculo",
        "login",
        "romaneioEntrada"
      ]);

      const statusPendente = await Status.findBy("descricao", "Pendente");

      const data = {
        PLACAVEICULO: dataRequest.placa,
        MOTORISTA: dataRequest.motorista,
        USER_CRIACAO: dataRequest.login,
        VEICULO: dataRequest.veiculo,
        STATUS_ID: statusPendente.id
      };

      if(!data.PLACAVEICULO || !data.MOTORISTA || !data.USER_CRIACAO || !data.VEICULO || !data.STATUS_ID)
        return response.status(400).send("Dados do romaneio não informados");

      if (dataRequest.romaneioEntrada) {
        data.ROMANEIOENTRADA = true;
      }

      const romaneio = await Romaneio.create(data);

      if (!dataRequest.romaneioEntrada) {
        dataRequest.nfs.map(async nf => {
          const NF = await NotaFiscal.findBy("CHAVE_NF", nf.CHAVE_NF);
          NF.merge({ ROMANEIO_ID: romaneio.id });
          NF.save();
        });
      }

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
        "motorista",
        "veiculo",
        "nfs"
      ]);

      const romaneio = await Romaneio.findOrFail(params.id);
      let newData = {};

      if (
        data.acao.toLowerCase() === "conferir" ||
        data.acao.toLowerCase() === "expedicao" ||
        data.acao.toLowerCase() === "entrega"
      ) {
        const statusId = await Status.findBy("descricao", data.status);

        switch (data.acao.toLowerCase()) {
          case "conferir":
            newData = {
              STATUS_ID: statusId.id,
              USER_CONFERIDO: data.login,
              DT_CONFERIDO: new Date(),
              PLACAVEICULO: data.placa,
              MOTORISTA: data.motorista
            };
            break;
          case "expedicao":
            newData = {
              STATUS_ID: statusId.id,
              USER_EMBARQUE: data.login,
              DT_EMBARQUE: new Date()
            };
            break;
          case "entrega":
            newData = {
              STATUS_ID: statusId.id,
              USER_ENTREGA: data.login,
              DT_ENTREGA: new Date()
            };
            break;
        }
      } else {
        newData = {
          PLACAVEICULO: data.placa,
          MOTORISTA: data.motorista,
          VEICULO: data.veiculo
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
        const consolidado = await geraInfoManifestoConsolidado(romaneio.id);

        const destinatarios = await geraInfoManifestoDestinatario(romaneio.id);

        await criaPDFConsolidado(consolidado);
        await criaPDFDestinatarios(destinatarios);

        await Mail.send("welcome", romaneio.toJSON(), message => {
          message
            .to("transporte@2amigos.com.br")
            .from("2amigostransportadora@gmail.com")
            .subject("Embarque 2 Amigos")
            .attach(
              path.join(
                __dirname,
                "..",
                "..",
                "..",
                "tmp",
                "exports",
                "relConsolidado.pdf"
              ),
              {
                filename: "Embarque2Amigos.pdf"
              }
            );
        });

        fs.unlinkSync(
          path.join(
            __dirname,
            "..",
            "..",
            "..",
            "tmp",
            "exports",
            "relConsolidado.pdf"
          )
        );

        const anexos = Object.keys(destinatarios.nfs).map(nf =>
          path.join(
            __dirname,
            "..",
            "..",
            "..",
            "tmp",
            "exports",
            `relEmbarque-${nf}.pdf`
          )
        );

        anexos.map(async anexo => {
          await Mail.send("welcome", romaneio.toJSON(), message => {
            message
              .to("transporte@2amigos.com.br")
              .from("2amigostransportadora@gmail.com")
              .subject("Manifesto 2 Amigos")
              .attach(anexo, {
                filename: `Manifesto2Amigos.pdf`
              });
          });

          fs.unlinkSync(anexo);
        });
      }

      return response.status(200).send(romaneio);
    } catch (error) {
      console.log(error);
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

  async reenviaRelatorios({ params, response }) {
    try {
      if (!params.id)
        return response.status(400).send({ error: "Informe o romaneio" });

      const romaneio = await Romaneio.find(params.id);

      const consolidado = await geraInfoManifestoConsolidado(params.id);
      const destinatarios = await geraInfoManifestoDestinatario(params.id);

      await criaPDFConsolidado(consolidado);
      await criaPDFDestinatarios(destinatarios);

      await Mail.send("welcome", romaneio.toJSON(), message => {
        message
          .to("transporte@2amigos.com.br")
          .from("2amigostransportadora@gmail.com")
          .subject("Embarque 2 Amigos")
          .attach(
            path.join(
              __dirname,
              "..",
              "..",
              "..",
              "tmp",
              "exports",
              "relConsolidado.pdf"
            ),
            {
              filename: "Embarque2Amigos.pdf"
            }
          );
      });

      fs.unlinkSync(
        path.join(
          __dirname,
          "..",
          "..",
          "..",
          "tmp",
          "exports",
          "relConsolidado.pdf"
        )
      );

      const anexos = Object.keys(destinatarios.nfs).map(nf =>
        path.join(
          __dirname,
          "..",
          "..",
          "..",
          "tmp",
          "exports",
          `relEmbarque-${nf}.pdf`
        )
      );

      anexos.map(async anexo => {
        await Mail.send("welcome", romaneio.toJSON(), message => {
          message
            .to("transporte@2amigos.com.br")
            .from("2amigostransportadora@gmail.com")
            .subject("Manifesto 2 Amigos")
            .attach(anexo, {
              filename: `Manifesto2Amigos.pdf`
            });
        });

        fs.unlinkSync(anexo);
      });

      return response.status(200).send(romaneio);
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async listRomaneioEntrada({ response }) {
    try {
      return Romaneio.query()
        .where("ROMANEIOENTRADA", "=", true)
        .with("nota_fiscal")
        .with("status")
        .with("motorista")
        .fetch();
    } catch (error) {
      return response.status(500).send(error.message);
    }
  }

  async exportToCSV({ request, response }) {
    function sleep(ms) {
      return new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    }

    try {
      const romaneios = request.only(["data"]);

      romaneios.data.map(async romaneio => {
        romaneio.status_desc = romaneio.status[0].descricao;
        romaneio.motorista_desc = romaneio.motorista.NOME;

        const veiculo = await TipoVeiculo.find(romaneio.VEICULO);
        romaneio.veiculo_desc = veiculo.tipo;

        if (romaneio.USER_CRIACAO) {
          const user = await Loja.find(romaneio.USER_CRIACAO);
          romaneio.user_criacao_desc = user.login;
        }

        if (romaneio.USER_CONFERIDO) {
          const user = await Loja.find(romaneio.USER_CONFERIDO);
          romaneio.user_conferido_desc = user.login;
        }

        if (romaneio.USER_EMBARQUE) {
          const user = await Loja.find(romaneio.USER_EMBARQUE);
          romaneio.user_embarque_desc = user.login;
        }

        if (romaneio.USER_ENTREGA) {
          const user = await Loja.find(romaneio.USER_ENTREGA);
          romaneio.user_entrega_desc = user.login;
        }

        return romaneio;
      });

      await sleep(1000);

      const fields = [
        "id",
        "PLACAVEICULO",
        "DT_CONFERIDO",
        "DT_EMBARQUE",
        "user_criacao_desc",
        "user_conferido_desc",
        "user_embarque_desc",
        "veiculo_desc",
        "motorista_desc",
        "DT_ENTREGA",
        "user_entrega_desc",
        "ROMANEIOENTRADA",
        "status_desc",
        "created_at"
      ];
      const opts = { fields };

      if (romaneios) {
        const xls = json2xls(romaneios.data, opts);
        const filename = `2amigos-romaneios.xlsx`;

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

      return response.status(400).send({ message: "Sem dados para exportar" });
    } catch (error) {
      return response.status(500).send(error.message);
    }
  }
}

module.exports = RomaneioController;
