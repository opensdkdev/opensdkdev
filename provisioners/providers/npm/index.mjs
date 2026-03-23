import { createNpmClient } from "../../services/npm-client.mjs";

export function createNpmProvisioner() {
  const npmClient = createNpmClient();

  return {
    id: "npm",
    async provision({ packageName, repository }) {
      await npmClient.ensurePackage(packageName, repository);
    }
  };
}
