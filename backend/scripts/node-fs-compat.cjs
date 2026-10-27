const fs = require('node:fs');

if (parseInt(process.versions.node, 10) >= 26) {
  const originalRmdirSync = fs.rmdirSync;

  fs.rmdirSync = (path, options) => {
    if (options?.recursive) {
      return fs.rmSync(path, { recursive: true, force: true });
    }

    return originalRmdirSync(path, options);
  };
}
