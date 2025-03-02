import { config } from "@/config";
import { Category } from "@/types/category";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

// 获取文件内容
export async function getGitHubFileContent(): Promise<Category[]> {
  const { owner, repo, branch, path } = config.github;
  const url = `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
      },
      next: {
        revalidate: 3600, // 缓存1小时
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from GitHub");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching from GitHub:", error);
    return [];
  }
}

// 更新文件内容
export async function updateGitHubFile(
  categories: Category[]
): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
    console.error("GitHub token not found");
    return false;
  }

  const { owner, repo, path } = config.github;

  try {
    // 1. 获取当前文件的 SHA
    const currentFileResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!currentFileResponse.ok) {
      throw new Error("Failed to get current file info");
    }

    const currentFile = await currentFileResponse.json();

    // 2. 更新文件
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: "Update sites.json",
          content: Buffer.from(JSON.stringify(categories, null, 2)).toString(
            "base64"
          ),
          sha: currentFile.sha,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error updating GitHub file:", error);
    return false;
  }
}
