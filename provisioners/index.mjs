import { parseArgs } from "./cli/parse-args.mjs";
import { loadPackageContexts, validateSourcePackages, filterPackageContexts } from "./core/package-contexts.mjs";
import { createProvisioners } from "./core/create-provisioners.mjs";
import { log } from "./utils/log.mjs";

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const packageContexts = await loadPackageContexts();
  const provisioners = createProvisioners();

  validateSourcePackages(packageContexts);

  const contextsToProcess = filterPackageContexts(packageContexts, options.packageDir);

  if (contextsToProcess.length === 0) {
    throw new Error("No packages matched the requested filter.");
  }

  for (const context of contextsToProcess) {
    for (const provisioner of provisioners) {
      const targets = provisioner.getTargets(context);

      if (options.validateOnly) {
        continue;
      }

      for (const target of targets) {
        await provisioner.provision(target);
      }
    }
  }

  if (options.validateOnly) {
    log(`Validated ${contextsToProcess.length} package definition(s)`);
  }
}
