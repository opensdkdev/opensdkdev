import { createGitHubProvisioner } from "../providers/github/index.mjs";
import { createNpmProvisioner } from "../providers/npm/index.mjs";
import { createTypescriptProvisioner } from "../targets/typescript/index.mjs";

export function createProvisioners() {
  const githubProvisioner = createGitHubProvisioner();
  const npmProvisioner = createNpmProvisioner();

  return [
    createTypescriptProvisioner({
      githubProvisioner,
      npmProvisioner
    })
  ];
}
