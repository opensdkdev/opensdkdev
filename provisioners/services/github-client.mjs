import { githubApiBaseUrl, githubOwner } from "../config.mjs";
import { log } from "../utils/log.mjs";

export function createGitHubClient() {
  return {
    ensureRepository,
    request: githubRequest
  };
}

async function ensureRepository(repository, packageName) {
  const [owner, repoName] = repository.split("/");
  if (owner !== githubOwner || repoName == null || repoName.length === 0) {
    throw new Error(`Unsupported GitHub repository target: ${repository}`);
  }

  let repo = await githubRequest("GET", `/repos/${repository}`, {
    allow404: true,
    requireAuth: false
  });

  if (repo == null) {
    log(`Creating GitHub repository ${repository}`);
    repo = await githubRequest("POST", `/orgs/${githubOwner}/repos`, {
      body: {
        name: repoName,
        description: `Generated SDK package for ${packageName}`,
        private: false,
        auto_init: true
      }
    });
  } else {
    log(`GitHub repository ${repository} already exists`);
  }

  let defaultBranch = repo.default_branch;
  if (typeof defaultBranch !== "string" || defaultBranch.length === 0) {
    defaultBranch = await initializeRepository(repository, repoName);
  }

  await ensureReadme(repository, defaultBranch, repoName);
}

async function initializeRepository(repository, repoName) {
  log(`Initializing empty GitHub repository ${repository}`);

  const readmeContent = `# ${repoName}\n`;
  const blob = await githubRequest("POST", `/repos/${repository}/git/blobs`, {
    body: {
      content: readmeContent,
      encoding: "utf-8"
    }
  });
  const tree = await githubRequest("POST", `/repos/${repository}/git/trees`, {
    body: {
      tree: [
        {
          path: "README.md",
          mode: "100644",
          type: "blob",
          sha: blob.sha
        }
      ]
    }
  });
  const commit = await githubRequest("POST", `/repos/${repository}/git/commits`, {
    body: {
      message: "chore: initialize repository",
      tree: tree.sha
    }
  });

  await githubRequest("POST", `/repos/${repository}/git/refs`, {
    body: {
      ref: "refs/heads/main",
      sha: commit.sha
    }
  });
  await githubRequest("PATCH", `/repos/${repository}`, {
    body: {
      default_branch: "main"
    }
  });

  return "main";
}

async function ensureReadme(repository, branch, repoName) {
  const readme = await githubRequest(
    "GET",
    `/repos/${repository}/contents/README.md?ref=${encodeURIComponent(branch)}`,
    {
      allow404: true,
      requireAuth: false
    }
  );

  if (readme != null) {
    return;
  }

  log(`Adding README.md to ${repository}`);
  await githubRequest("PUT", `/repos/${repository}/contents/README.md`, {
    body: {
      message: "chore: initialize repository",
      content: Buffer.from(`# ${repoName}\n`, "utf8").toString("base64"),
      branch
    }
  });
}

async function githubRequest(method, pathname, options = {}) {
  const { allow404 = false, body, requireAuth = true } = options;
  const githubToken = process.env.GH_TOKEN?.trim();

  if (!githubToken && requireAuth) {
    throw new Error(`GH_TOKEN is required for GitHub API request ${method} ${pathname}.`);
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  if (body != null) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${githubApiBaseUrl}${pathname}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body)
  });

  if (response.status === 404 && allow404) {
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API request failed for ${method} ${pathname}: ${response.status} ${errorBody}`);
  }

  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  return responseText.length === 0 ? null : JSON.parse(responseText);
}
