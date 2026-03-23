import path from "node:path";

export function parseArgs(args) {
  const options = {
    packageDir: null,
    validateOnly: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--validate-only") {
      options.validateOnly = true;
      continue;
    }

    if (argument === "--") {
      continue;
    }

    if (argument === "--package-dir") {
      const value = args[index + 1];
      if (value == null) {
        throw new Error("--package-dir requires a value.");
      }

      options.packageDir = path.resolve(process.cwd(), value);
      index += 1;
      continue;
    }

    throw new Error(`Unsupported argument: ${argument}`);
  }

  return options;
}
