import type { NextApiRequest } from 'next';

export const runtime = 'edge';

export default async function handler(req: NextApiRequest) {
  const client_id = process.env.GITHUB_ID;

  if (!client_id) {
    return new Response(JSON.stringify({ message: 'GitHub Client ID not provided' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const redirectUrl = new URL('https://github.com/login/oauth/authorize');
    redirectUrl.searchParams.set('client_id', client_id);
    redirectUrl.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
    redirectUrl.searchParams.set('scope', 'repo user');
    redirectUrl.searchParams.set('state', crypto.randomUUID());

    // Return a redirect response
    return Response.redirect(redirectUrl.href, 302);
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