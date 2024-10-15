import { NextApiRequest, NextApiResponse } from "next";

export const runtime = 'edge';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;
    const token = process.env.GITHUB_TOKEN;

    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/posts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch posts from GitHub");
    }

    const files: any = await response.json();

    // Optionally, filter out non-markdown files
    const markdownFiles = files.filter((file: any) =>
      file.name.endsWith(".md")
    );

    // Fetch the content of each markdown file
    const posts = await Promise.all(
      markdownFiles.map(async (file: any) => {
        const contentResponse = await fetch(file.download_url);
        const content = await contentResponse.text();
        return {
          filename: file.name,
          content,
        };
      })
    );

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load posts" });
  }
}
