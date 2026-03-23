import { githubOwner, packagePrefix } from "../../config.mjs";
import { log } from "../../utils/log.mjs";

export function createTypescriptProvisioner({ githubProvisioner, npmProvisioner }) {
  return {
    id: "typescript",
    getTargets(context) {
      const targetName = `${context.packageSlug}-typescript`;
      const generatedPackageName = `${packagePrefix}${targetName}`;
      const githubRepository = `${githubOwner}/${targetName}`;

      return [
        {
          context,
          targetName,
          generatedPackageName,
          githubRepository
        }
      ];
    },
    async provision(target) {
      log(`Provisioning TypeScript target for ${target.context.packageName}`);
      await githubProvisioner.provision({
        repository: target.githubRepository,
        packageName: target.generatedPackageName
      });
      await npmProvisioner.provision({
        packageName: target.generatedPackageName,
        repository: target.githubRepository
      });
    }
  };
}
