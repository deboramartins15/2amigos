"use strict";

const fs = use("fs");
const path = require("path");

class DownloadController {
  async download({ request, response }) {
    let dataArquivo = new Date();
    const hora = dataArquivo.getHours();
    const min = dataArquivo.getMinutes();
    const seg = dataArquivo.getSeconds();
    dataArquivo = dataArquivo
      .toLocaleDateString("pt-BR")
      .replace("/", "-")
      .replace("/", "-");
    dataArquivo = `${dataArquivo}-${hora}-${min}-${seg}`
    
    const filename = `2amigos-notasfiscais.xlsx`;
    const filenameDownload = `2amigos-notasfiscais${dataArquivo}.xlsx`;
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
