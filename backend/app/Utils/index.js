const Helpers = use("Helpers");
const Drive = use("Drive");
const crypto = require("crypto");
const parser = require("xml2json");

const NotaFiscal = use("App/Models/NotaFiscal");
const Romaneio = use("App/Models/Romaneio");

const pdf = require("html-pdf");
const path = require("path");

/**
 *
 * LOCAL FUNCTION
 */

function parseXmlToJson(xml) {
  try {
    // const json = {};
    // const matches = [...xml.matchAll(
    //   /(?:<(\w*)(?:\s[^>]*)*>)((?:(?!<\1).)*)(?:<\/\1>)|<(\w*)(?:\s*)*\/>/gm
    // )]

    // for (const res of matches) {
    //   const key = res[1] || res[3];
    //   const value = res[2] && parseXmlToJson(res[2]);
    //   json[key] = (value && Object.keys(value).length ? value : res[2]) || null;
    // }

    const json = parser.toJson(xml, { object: true });
    return json;
  } catch (error) {
    console.log(matches);
  }
}

function geraTableDestinatarios(destinatarios) {
  let temp = Object.keys(destinatarios.nfs).map(nf => {
    return `
      <div>
        <p>${nf}</p>
        <table>
          <tr>
            <th>CNPJ</th>
            <th>Número</th>
            <th>Volume</th>
            <th>Peso</th>
            <th>Valor</th>
          </tr>
          ${destinatarios.nfs[nf].map(n => {
            return `<tr>
            <td>${n.CNPJ_FAVORECIDO}</td>
            <td>${n.NUMERO_NF}</td>
            <td>${n.VOLUME}</td>
            <td>${n.PESO_BRUTO}</td>
            <td>${n.TOTAL_NF}</td>
          </tr>`;
          })}
        </table>
      </div>
    `;
  });

  temp = temp.join("")

  while(temp.indexOf(",") >= 0){
    temp = temp.replace(",", " ")
  }

  return temp
}

/**
 *
 * EXPORTED FUNCTION
 */

async function getJsonFromXML(xml) {
  await xml.move(Helpers.tmpPath("uploads"), {
    name: crypto.randomBytes(16).toString("hex") + "-" + xml.clientName,
    overwrite: true
  });

  if (!xml.moved()) {
    return xml.error();
  }

  const exists = await Drive.exists(
    Helpers.tmpPath("uploads") + "/" + xml.fileName
  );

  if (exists) {
    const xmlFile = await Drive.get(
      Helpers.tmpPath("uploads") + "/" + xml.fileName
    );
    const json = parseXmlToJson(xmlFile.toString());

    await Drive.delete(Helpers.tmpPath("uploads") + "/" + xml.fileName);

    return json;
  }

  return {};
}

async function geraInfoManifestoConsolidado(romaneioId) {
  const romaneio = await Romaneio.find(romaneioId);

  const nfs = await NotaFiscal.query()
    .where("ROMANEIO_ID", "=", romaneioId)
    .fetch();

  const nfsJSON = nfs.toJSON();
  let totalNf = 0;
  let totalVolume = 0;
  nfsJSON.map(nf => {
    totalNf += parseFloat(nf.TOTAL_NF);
    totalVolume += parseFloat(nf.VOLUME);
  });

  return {
    romaneio: romaneio.toJSON(),
    nfs: nfsJSON,
    totais: {
      valorNf: totalNf.toFixed(2),
      Volume: totalVolume,
      QtdNfs: nfsJSON.length
    }
  };
}

async function geraInfoManifestoDestinatario(romaneioId) {
  const romaneio = await Romaneio.find(romaneioId);

  const nfs = await NotaFiscal.query()
    .where("ROMANEIO_ID", "=", romaneioId)
    .fetch();

  const nfsJSON = nfs.toJSON();

  let totalNf = 0;
  let totalVolume = 0;

  nfsJSON.map(nf => {
    totalNf += parseFloat(nf.TOTAL_NF);
    totalVolume += parseFloat(nf.VOLUME);
  });

  const destinatarios = nfsJSON.reduce(
    (
      obj,
      {
        RAZAOSOCIAL_FAVORECIDO,
        TOTAL_NF,
        NUMERO_NF,
        VOLUME,
        PESO_BRUTO,
        CNPJ_FAVORECIDO
      }
    ) => {
      if (!obj[RAZAOSOCIAL_FAVORECIDO]) obj[RAZAOSOCIAL_FAVORECIDO] = [];
      obj[RAZAOSOCIAL_FAVORECIDO].push({
        CNPJ_FAVORECIDO,
        TOTAL_NF,
        NUMERO_NF,
        VOLUME,
        PESO_BRUTO,
        RAZAOSOCIAL_FAVORECIDO
      });
      return obj;
    },
    {}
  );

  return {
    romaneio: romaneio.toJSON(),
    nfs: destinatarios,
    totais: {
      valorNf: totalNf.toFixed(2),
      Volume: totalVolume,
      QtdNfs: nfsJSON.length
    }
  };
}

async function criaPDFConsolidado(consolidado) {
  const html = `
    <html>
    <head></head>
    <style>
      table,
      th,
      td {
        border: 1px solid black;
        border-collapse: collapse;
        text-align: center;
      }

      th,
      td {
        min-width: 80px;
        font-size: 12px;
      }

      .title {
        font-size: 24px;
        text-align: center;
        margin-top: 20px;
      }

      .assinatura-content {
        width: 100%;
        display: flex;
        margin-top: 20px;
        margin-left: 150px;
        text-align: center;
      }
      .assinatura-content-left,
      .assinatura-content-right {
        width: 50%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }
      .impressao{
        font-size: 11px;
        text-align: center;
      }
    </style>
    <body>
      <p>Transportadora 2 amigos</p>      
      <h1 class="title">Relatório Consolidado</h1>
      <p>
        <strong>Romaneio:</strong> ${consolidado.romaneio.id}
        <strong>Placa do veículo:</strong> ${consolidado.romaneio.PLACAVEICULO}
        <strong>Doc. Motorista:</strong> ${consolidado.romaneio.DOCMOTORISTA}
      </p>
      <table style="width: 100%">
        <tr>
          <th>Razão Social</th>
          <th>CNPJ</th>
          <th>Número</th>
          <th>Volume</th>
          <th>Peso</th>
          <th>Valor</th>
        </tr>
        ${consolidado.nfs
          .map(nf => {
            return `
        <tr>
          <td>${nf.RAZAOSOCIAL_FAVORECIDO}</td>
          <td>${nf.CNPJ_FAVORECIDO}</td>
          <td>${nf.NUMERO_NF}</td>
          <td>${nf.VOLUME}</td>
          <td>${nf.PESO_BRUTO}</td>
          <td>${nf.TOTAL_NF}</td>
        </tr>
        `;
          })
          .join()
          .replace(",", " ")}
        <tfooter>
          <tr>
            <td>Total Qtd</td>
            <td>2</td>
            <td>Total Volume</td>
            <td>75</td>
            <td>Total Valor</td>
            <td>15537,60</td>
          </tr>
        </tfooter>
      </table>
      <div class="assinatura-content">
        <div class="assinatura-content-left">
          <span>_______________________________</span>
          <span> Assinatura motorista</span>
        </div>
        <div class="assinatura-content-right">
          <span>_______________________________</span>
          <span> Número de identificação</span>
        </div>
      </div>
      <p class="impressao">Impresso em ${new Date().toLocaleDateString(
        "pt-BR"
      )}</p>
    </body>
  </html>
  `;
  const filepath = path.join(
    __dirname,
    "..",
    "..",
    "tmp",
    "exports",
    "relConsolidado.pdf"
  );

  pdf.create(html).toFile(filepath, (err, res) => {
    if (err) console.log(err);
  });
}

async function criaPDFDestinatarios(destinatarios) {
  const tables = geraTableDestinatarios(destinatarios);

  const html = `
    <html>
    <head></head>
    <style>
      table,
      th,
      td {
        width: 100%;
        border: 1px solid black;
        border-collapse: collapse;
        text-align: center;
      }

      th,
      td {
        min-width: 80px;
        font-size: 12px;
      }

      .title {
        font-size: 24px;
        text-align: center;
        margin-top: 20px;
      }

      .assinatura-content {
        width: 100%;
        display: flex;
        margin-top: 20px;
        margin-left: 150px;
        text-align: center;
      }
      .assinatura-content-left,
      .assinatura-content-right {
        width: 50%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }
      .impressao{
        font-size: 11px;
        text-align: center;
      }
    </style>
    <body>
      <p>Transportadora 2 amigos</p>      
      <h1 class="title">Relatório Destinatários</h1>
      <p>
        <strong>Romaneio:</strong> ${destinatarios.romaneio.id}
        <strong>Placa do veículo:</strong> ${
          destinatarios.romaneio.PLACAVEICULO
        }
        <strong>Doc. Motorista:</strong> ${destinatarios.romaneio.DOCMOTORISTA}
      </p>
      ${tables.replace(",", " ")}
      <div class="assinatura-content">
        <div class="assinatura-content-left">
          <span>_______________________________</span>
          <span> Assinatura motorista</span>
        </div>
        <div class="assinatura-content-right">
          <span>_______________________________</span>
          <span> Número de identificação</span>
        </div>
      </div>
      <p class="impressao">Impresso em ${new Date().toLocaleDateString(
        "pt-BR"
      )}</p>
    </body>
  </html>
  `;
  const filepath = path.join(
    __dirname,
    "..",
    "..",
    "tmp",
    "exports",
    "relDestinatario.pdf"
  );

  pdf.create(html).toFile(filepath, (err, res) => {
    if (err) console.log(err);
  });
}

module.exports = {
  getJsonFromXML,
  geraInfoManifestoConsolidado,
  geraInfoManifestoDestinatario,
  criaPDFConsolidado,
  criaPDFDestinatarios
};
