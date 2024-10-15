import { NextRequest } from "next/server";

export const runtime = 'edge';

export default async function handler(req: NextRequest) {
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
      return new Response(JSON.stringify({ message: "Failed to fetch posts from GitHub" }), { status: 500 });
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

    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Failed to load posts" }), { status: 500 });
  }
}
