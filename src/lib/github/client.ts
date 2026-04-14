import { prisma } from "../db";

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
}

interface GitHubReadme {
  content: string;
  encoding: string;
}

async function getAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) {
    throw new Error("No GitHub access token found for user");
  }

  return account.access_token;
}

async function githubFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchUserRepos(userId: string): Promise<GitHubRepo[]> {
  const token = await getAccessToken(userId);
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    const batch = await githubFetch<GitHubRepo[]>(
      `/user/repos?per_page=100&page=${page}&sort=updated&type=owner`,
      token
    );

    if (batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
    page++;
  }

  return repos;
}

export async function fetchReadme(
  userId: string,
  owner: string,
  repo: string
): Promise<string | null> {
  const token = await getAccessToken(userId);

  try {
    const data = await githubFetch<GitHubReadme>(
      `/repos/${owner}/${repo}/readme`,
      token
    );

    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    return decoded.slice(0, 500);
  } catch {
    return null;
  }
}
