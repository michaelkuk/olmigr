const fs = require("node:fs");
const path = require("node:path");
const tar = require("tar-stream");

const { nameToManifestRelativePath } = require("./util");

const createEntry = (opts, content, pack) =>
  new Promise((resolve, reject) => {
    pack.entry(opts, content, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });

const streamEntry = (opts, srcStrm, pack) =>
  new Promise((resolve, reject) => {
    const sink = pack.entry(opts, (err) => {
      if (err) return reject(err);
      return resolve();
    });

    srcStrm.pipe(sink);
  });

const exportTarStream = async (model, arch) => {
  try {
    await createEntry(
      { name: nameToManifestRelativePath(model.name) },
      JSON.stringify(model.manifest),
      arch,
    );

    for (const blob of model.blobs) {
      const stat = await fs.promises.stat(blob);
      const src = fs.createReadStream(blob);

      await streamEntry(
        { name: path.join("blobs", path.basename(blob)), size: stat.size },
        src,
        arch,
      );
    }

    arch.finalize();
  } catch {
    arch.destroy();
  }
};

exports.exportModel = (model) => {
  const arch = tar.pack();

  //exportTarStream(model, arch);
  process.nextTick(() => exportTarStream(model, arch));

  return arch;
};
