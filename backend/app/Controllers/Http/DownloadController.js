"use strict";

const fs = use("fs");
const path = require("path");

class DownloadController {
  async download({ request, response }) {
    const dataArquivo = new Date()
      .toLocaleDateString("pt-BR")
      .replace("/", "-")
      .replace("/", "-");
    const filename = `2amigos-notasfiscais${dataArquivo}.csv`;
    const file = path.join(__dirname, "..", "..", "..", "tmp", "exports", filename);

    response.header("Access-Control-Allow-Origin", "*");
    response.header("Content-disposition", `attachment; filename=${filename}`);
    response.header("Content-type", "text/csv");

    response.download(file);    
  }
}

module.exports = DownloadController;
