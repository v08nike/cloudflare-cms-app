import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export const config = {
  runtime: "nodejs",
};

const postsDirectory = path.join(process.cwd(), "posts");

interface PostData {
  title: string;
  [key: string]: any;
}

// Function to convert markdown to HTML
async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;

  if (typeof slug !== "string") {
    return res.status(400).json({ message: "Invalid slug" });
  }

  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: "Data not found" });
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");

  const { data, content } = matter(fileContents);

  const postData: PostData = data as PostData;

  const contentHtml = await markdownToHtml(content);

  res.status(200).json({
    slug,
    data: postData,
    content: contentHtml,
  });
}
