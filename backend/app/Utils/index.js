const Helpers = use("Helpers");
const Drive = use("Drive");
const crypto = require("crypto");

/**
 *
 * LOCAL FUNCTION
 */

function parseXmlToJson(xml) {
  const json = {};
  for (const res of xml.matchAll(
    /(?:<(\w*)(?:\s[^>]*)*>)((?:(?!<\1).)*)(?:<\/\1>)|<(\w*)(?:\s*)*\/>/gm
  )) {
    const key = res[1] || res[3];
    const value = res[2] && parseXmlToJson(res[2]);
    json[key] = (value && Object.keys(value).length ? value : res[2]) || null;
  }
  return json;
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
