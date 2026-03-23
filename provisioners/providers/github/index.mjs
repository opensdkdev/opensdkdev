import { createGitHubClient } from "../../services/github-client.mjs";

export function createGitHubProvisioner() {
  const githubClient = createGitHubClient();

  return {
    id: "github",
    async provision({ repository, packageName }) {
      await githubClient.ensureRepository(repository, packageName);
    }
  };
}
