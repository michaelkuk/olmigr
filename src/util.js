const path = require("node:path");

exports.OLLAMA_MODEL_DIR =
  process.env.OLLAMA_MODEL_DIR ||
  path.resolve(process.env.HOME, ".ollama", "models");

exports.manifestPathToName = (name, dp) => {
  const tag = name;
  const modelName = path.basename(dp);
  const modelVendor = path.basename(path.dirname(dp));

  if (modelVendor === "library") return `${modelName}:${tag}`;

  return `${modelVendor}/${modelName}:${tag}`;
};

exports.nameToManifestRelativePath = (name) => {
  const pName = name.replace(":", "/");
  const segLen = pName.split("/").length;

  if (segLen < 3) {
    return path.join("manifests", "library", pName);
  }

  return path.join("manifests", pName);
};
