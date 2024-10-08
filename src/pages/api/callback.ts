import type { NextApiRequest, NextApiResponse } from "next";

function renderBody(status: string, content: object): string {
  const html = `
    <script>
      const receiveMessage = (message) => {
        window.opener.postMessage(
          'authorization:github:${status}:${JSON.stringify(content)}',
          message.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    </script>
  `;
  return html;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client_id = process.env.GITHUB_ID;
  const client_secret = process.env.GITHUB_SECRET;

  if (!client_id || !client_secret) {
    return res
      .status(500)
      .json({ message: "GitHub Client ID or Secret not provided" });
  }

  try {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const code = url.searchParams.get("code");

    if (!code) {
      return res
        .status(400)
        .json({ message: "Code not provided in the callback URL" });
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "nextjs-github-oauth-login-demo",
          accept: "application/json",
        },
        body: JSON.stringify({ client_id, client_secret, code }),
      }
    );

    const tokenData: any = await tokenResponse.json();

    if (tokenData.error) {
      res.status(401).send(renderBody("error", tokenData));
      return;
    }

    const token = tokenData.access_token;
    const provider = "github";
    const responseBody = renderBody("success", { token, provider });

    res.status(200).send(responseBody);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
}
