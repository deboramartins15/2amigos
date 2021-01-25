"use strict";

const fs = use("fs");
const path = require("path");

class DownloadController {
  async download({ request, response,params }) {
    let dataArquivo = new Date();
    const hora = dataArquivo.getHours();
    const min = dataArquivo.getMinutes();
    const seg = dataArquivo.getSeconds();
    dataArquivo = dataArquivo
      .toLocaleDateString("pt-BR")
      .replace("/", "-")
      .replace("/", "-");
    dataArquivo = `${dataArquivo}-${hora}-${min}-${seg}`
   
    const tipoExport = params.type
    const filename = `2amigos-${tipoExport == 'nf' ? 'notasfiscais' : 'romaneios' }.xlsx`;
    const filenameDownload = `2amigos-${tipoExport == 'nf' ? 'notasfiscais' : 'romaneios' }${dataArquivo}.xlsx`;
    const file = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "tmp",
      "exports",
      filename
    );

    response.header("Access-Control-Allow-Origin", "*");
    response.header(
      "Content-disposition",
      `attachment; filename=${filenameDownload}`
    );
    response.header("Content-type", "application/excel");

    response.download(file);
  }
}

module.exports = DownloadController;
