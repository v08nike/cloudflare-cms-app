import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client_id = process.env.GITHUB_ID;

  if (!client_id) {
    return res.status(500).json({ message: 'GitHub Client ID not provided' });
  }

  try {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const redirectUrl = new URL('https://github.com/login/oauth/authorize');
    redirectUrl.searchParams.set('client_id', client_id);
    redirectUrl.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
    redirectUrl.searchParams.set('scope', 'repo user');
    redirectUrl.searchParams.set('state', crypto.randomUUID()); // Using crypto.randomUUID() for a state token

    // Redirect to GitHub OAuth login page
    res.redirect(redirectUrl.href);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
}