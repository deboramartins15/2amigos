const Helpers = use("Helpers");
const Drive = use("Drive");
const crypto = require("crypto");
const parser = require("xml2json");

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

module.exports = { getJsonFromXML };
