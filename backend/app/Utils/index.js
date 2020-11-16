const Helpers = use("Helpers");
const Drive = use("Drive");
const crypto = require("crypto");
const parser = require("xml2json");

const NotaFiscal = use("App/Models/NotaFiscal");
const Romaneio = use("App/Models/Romaneio");

// const PDFDocument = require("pdfkit");
var pdf = require("html-pdf");
const fs = require("fs");

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
  let totalNf = 0,
    totalVolume = 0;
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
  let totalNf = 0,
    totalVolume = 0;
  nfsJSON.map(nf => {
    totalNf += parseFloat(nf.TOTAL_NF);
    totalVolume += parseFloat(nf.VOLUME);
  });

  const destinatarios = nfsJSON.reduce(
    (
      obj,
      { RAZAOSOCIAL_FAVORECIDO, TOTAL_NF, NUMERO_NF, VOLUME, PESO_BRUTO }
    ) => {
      if (!obj[RAZAOSOCIAL_FAVORECIDO]) obj[RAZAOSOCIAL_FAVORECIDO] = [];
      obj[RAZAOSOCIAL_FAVORECIDO].push({
        TOTAL_NF,
        NUMERO_NF,
        VOLUME,
        PESO_BRUTO
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
    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
      text-align: center;  
    }

    h1{
      font-size: 20px;
      text-align: center;
      margin-top: 16px;
    }

    .idMot{
      margin-top: 16px;
      text-align: center;
      
    }

    .assinatura{
      text-align: center;
      font-size: 11px;
    }

     .idMot .segEspaco{
      margin-left: 18px;
    }

    .assinatura .numIdMot{
      margin-left: 30px;
    }
    

    p {
      margin-top: 5px;
    }
    </style>
    <body>
      <p>Transportadora 2 amigos</p>
      <h1>Relatório Consolidado</h1>
      <p><strong>Romaneio:</strong> ${consolidado.romaneio.id}  <strong>Placa do veículo:</strong> ${consolidado.romaneio.PLACAVEICULO} <strong>Doc. Motorista:</strong> ${consolidado.romaneio.DOCMOTORISTA}</p>
      <table style="width:100%">
    <tr>
      <th>Razão Social</th>
      <th>CNPJ</th>
      <th>Número</th>
      <th>Volume</th>
      <th>Peso</th>
      <th>Valor</th>
    </tr>
      ${consolidado.nfs.map(nf => {
        return (
         ` <tr>
            <td>${nf.RAZAOSOCIAL_FAVORECIDO}</td>
            <td>${nf.CNPJ_FAVORECIDO}</td>
            <td>${nf.NUMERO_NF}</td>
            <td>${nf.VOLUME}</td>
            <td>${nf.PESO_BRUTO}</td>
            <td>${nf.TOTAL_NF}</td>
          </tr> `
        );
      })}
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
  <div class="idMot">
  <span>_____________________</span>
  <span class="segEspaco">_____________________</span>
  </div>
  <div class="assinatura">
  <span> Assinatura motorista</span>
  <span class="numIdMot"> Número de identificação</span>
  </div>    
  </html>`;

  pdf.create(html).toFile("output.pdf", (err, res) => {
    if(err) console.log(err)
    console.log(res.filename);
  });
  // const pdf = new PDFDocument();

  // pdf.text("Transportadora 2 amigos", 40, 20);

  // pdf.fontSize(18).text("Relatório Consolidado", {
  //   width: 550,
  //   align: "center"
  // });

  // console.log(consolidado);

  // pdf
  //   .fontSize(12)
  //   .text(
  //     `Romaneio: ${consolidado.romaneio.id}  Placa veículo: ${consolidado.romaneio.PLACAVEICULO}  Doc. Motorista: ${consolidado.romaneio.DOCMOTORISTA}`,
  //     40,
  //     80
  //   );

  // pdf.fontSize(13).text(`CNPJ                  Número  Volume   Peso   Valor           Razão Favorecido`,40,100)
  // consolidado.nfs.map(nf => {
  //   pdf.fontSize(11).text(`${nf.CNPJ_FAVORECIDO}     ${nf.NUMERO_NF}          ${nf.VOLUME}            ${nf.PESO_BRUTO}   R$${nf.TOTAL_NF}    ${nf.RAZAOSOCIAL_FAVORECIDO}`)
  // })

  // pdf.addPage()
  // pdf.fontSize(13).text(`Total documento:  Valor Total Notas Fiscais   Total Volume   Total Qtd`,40,20)
  // pdf.fontSize(11).text(`                  R$${consolidado.totais.valorNf}    ${consolidado.totais.Volume}    ${consolidado.totais.QtdNfs}`,40,30)

  // pdf.pipe(fs.createWriteStream("output.pdf"));
  // pdf.end();
}
async function criaPDFDestinatarios(destinatarios) {}

module.exports = {
  getJsonFromXML,
  geraInfoManifestoConsolidado,
  geraInfoManifestoDestinatario,
  criaPDFConsolidado
};
