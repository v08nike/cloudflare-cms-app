import type { NextApiRequest } from "next";

export const runtime = 'edge';

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

export default async function handler(req: NextApiRequest) {
  const client_id = process.env.GITHUB_ID;
  const client_secret = process.env.GITHUB_SECRET;

  if (!client_id || !client_secret) {
    return new Response(JSON.stringify({ message: "GitHub Client ID or Secret not provided" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response(JSON.stringify({ message: "Code not provided in the callback URL" }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
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
      const errorBody = renderBody("error", tokenData);
      return new Response(errorBody, {
        status: 401,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    const token = tokenData.access_token;
    const provider = "github";
    const responseBody = renderBody("success", { token, provider });

    return new Response(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
