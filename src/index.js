const fs = require("node:fs");
const path = require("node:path");

const desiredModel = process.argv[2];
const dest = process.argv[3];

(async () => {
  const { getAvailableModels } = require("./model_finder");
  const { exportModel } = require("./model_exporter");

  const models = await getAvailableModels();

  const mod = models[desiredModel];

  if (!mod) {
    console.error("Model not found");
    process.exit(-1);
  }

  const dst = fs.createWriteStream(path.resolve(process.cwd(), dest));

  const tarStrm = exportModel(mod);

  tarStrm.once("error", (e) => {
    console.log("error :(");
  });

  tarStrm.pipe(dst);
})();
