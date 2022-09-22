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

    if(json?.nfeProc?.protNFe?.infProt?.chNFe) return json;
  }

  return {};
}

async function geraInfoManifestoConsolidado(romaneioId) {
  const romaneio = await Romaneio.find(romaneioId);
  await romaneio.load("motorista")

  const nfs = await NotaFiscal.query()
    .where("ROMANEIO_ID", "=", romaneioId)
    .fetch();

  const nfsJSON = nfs.toJSON();

  if(nfsJSON.length == 0) throw new Error("Não foi possível gerar o relatório");
  
  let totalNf = 0;
  let totalVolume = 0;
  let totalPeso = 0;
  nfsJSON.map(nf => {
    totalNf += parseFloat(nf.TOTAL_NF);
    totalVolume += parseFloat(nf.VOLUME);
    totalPeso += parseFloat(nf.PESO_BRUTO);
  });

  return {
    romaneio: romaneio.toJSON(),
    nfs: nfsJSON,
    totais: {
      valorNf: totalNf.toFixed(2),
      Volume: totalVolume,
      peso: totalPeso,
      QtdNfs: nfsJSON.length
    }
  };
}

async function geraInfoManifestoDestinatario(romaneioId) {
  const romaneio = await Romaneio.find(romaneioId);
  await romaneio.load("motorista")

  const nfs = await NotaFiscal.query()
    .where("ROMANEIO_ID", "=", romaneioId)
    .fetch();

  const nfsJSON = nfs.toJSON();

  if(nfsJSON.length == 0) throw new Error("Não foi possível gerar o relatório");

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

  Object.keys(destinatarios).map(dest => {
    let totalNf = 0;
    let totalVolume = 0;
    let totalPeso = 0;
    destinatarios[dest].map(nf => {
      totalNf += parseFloat(nf.TOTAL_NF);
      totalVolume += parseFloat(nf.VOLUME);
      totalPeso += parseFloat(nf.PESO_BRUTO);
    });
    destinatarios[dest].totais = {
      totalNf,
      totalVolume,
      peso: totalPeso,
      QtdNfs: destinatarios[dest].length
    };
  });

  return {
    romaneio: romaneio.toJSON(),
    nfs: destinatarios
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

      img{
        width: 80px;
        heigth: 80px;
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
      <img src=${path.join(
        "file://",
        __dirname,
        "..",
        "..",
        "tmp",
        "logo-2amigos.jpeg"
      )} alt="logo" />
      <h1 class="title">Embarque 2 Amigos</h1>
      <p>
        <strong>Romaneio:</strong> ${consolidado.romaneio.id}
        <strong>Placa do veículo:</strong> ${consolidado.romaneio.PLACAVEICULO}
        <strong>Motorista:</strong> ${consolidado.romaneio.motorista.NOME}
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
          .join("")
          .replace(",", " ")}
        <tfooter>
          <tr>
            <td>Total Qtd</td>
            <td>${consolidado.totais.QtdNfs}</td>
            <td>Total Volume</td>
            <td>${consolidado.totais.Volume}</td>
            <td>${consolidado.totais.peso}</td>
            <td>${consolidado.totais.valorNf}</td>
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
  Object.keys(destinatarios.nfs).map(nf => {
    const html =`
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

      img{
        width: 80px;
        heigth: 80px;
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
        <img src=${path.join(
          "file://",
          __dirname,
          "..",
          "..",
          "tmp",
          "logo-2amigos.jpeg"
        )} alt="logo" />
        <h1 class="title">Manifesto 2 Amigos</h1>
        <p>
          <strong>Romaneio:</strong> ${destinatarios.romaneio.id}
          <strong>Placa do veículo:</strong> ${
            destinatarios.romaneio.PLACAVEICULO
          }
          <strong>Motorista:</strong> ${destinatarios.romaneio.motorista.NOME}
        </p>
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
            <tfooter>
            <tr>
              <td>Totais:</td>
              <td>${destinatarios.nfs[nf].totais.QtdNfs}</td>
              <td>${destinatarios.nfs[nf].totais.totalVolume}</td>
              <td>${destinatarios.nfs[nf].totais.peso}</td>
              <td>${destinatarios.nfs[nf].totais.totalNf}</td>
            </tr>
          </tfooter>
          </table>
          </div>
          <div class="assinatura-content">
          <div class="assinatura-content-left">
            <span>_______________________________</span>
            <span> Assinatura recebedor</span>
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
    `
    const filepath = path.join(
      __dirname,
      "..",
      "..",
      "tmp",
      "exports",
      `relEmbarque-${nf}.pdf`
    );

    pdf.create(html).toFile(filepath, (err, res) => {
      if (err) console.log(err);
    });
  })

}

module.exports = {
  getJsonFromXML,
  geraInfoManifestoConsolidado,
  geraInfoManifestoDestinatario,
  criaPDFConsolidado,
  criaPDFDestinatarios
};
