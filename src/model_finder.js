const fs = require("node:fs");
const path = require("node:path");

const { OLLAMA_MODEL_DIR, manifestPathToName } = require("./util");

const getAvailableModels = async () => {
  const tree = await fs.promises.readdir(
    path.resolve(OLLAMA_MODEL_DIR, "manifests"),
    { recursive: true, withFileTypes: true },
  );

  const files = tree.filter((t) => t.isFile());

  const avaiableModels = files.map((file) => {
    const name = manifestPathToName(file.name, file.parentPath);
    const manifest = JSON.parse(
      fs.readFileSync(path.resolve(file.parentPath, file.name)),
    );

    const blobs = manifest.layers.map((l) =>
      path.resolve(OLLAMA_MODEL_DIR, "blobs", l.digest.replace(":", "-")),
    );

    return {
      name,
      manifest,
      blobs,
    };
  });

  const models = avaiableModels.reduce((acc, v) => {
    acc[v.name] = v;
    return acc;
  }, {});

  return models;
};

module.exports = {
  getAvailableModels,
};
