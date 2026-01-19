import { Request, Response } from 'express';
import axios from 'axios';
import { randomBytes } from 'crypto';

const requireEnv = (key: string) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env var ${key}`);
  return val;
};

export const githubLogin = async (req: Request, res: Response) => {
  try {
    const clientId = requireEnv('GITHUB_CLIENT_ID');
    const callbackUrl = requireEnv('GITHUB_CALLBACK_URL');

    const state = randomBytes(16).toString('hex');
    // store state in session to validate on callback (CSRF protection)
    (req.session as any).oauthState = state;

    const redirectUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&scope=${encodeURIComponent('user:email')}` +
      `&state=${encodeURIComponent(state)}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('githubLogin error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const githubCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  if (!code) {
    return res.status(400).json({ message: 'Code missing' });
  }

  try {
    const sessionState = (req.session as any).oauthState as string | undefined;
    if (!state || !sessionState || state !== sessionState) {
      return res.status(400).json({ message: 'Invalid state' });
    }
    // remove stored state
    delete (req.session as any).oauthState;

    const clientId = requireEnv('GITHUB_CLIENT_ID');
    const clientSecret = requireEnv('GITHUB_CLIENT_SECRET');
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const accessToken = tokenResponse.data?.access_token;
    if (!accessToken) {
      console.error('No access_token in token response:', tokenResponse.data);
      return res.redirect(`${clientUrl}/auth?error=oauth`);
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const githubUser = userResponse.data;

    // GitHub may not return email on /user - fetch emails endpoint as fallback
    let email = githubUser.email;
    if (!email) {
      try {
        const emailsResp = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const emails = emailsResp.data as Array<any>;
        const primary =
          emails.find((e) => e.primary && e.verified) ||
          emails.find((e) => e.verified) ||
          emails[0];
        email = primary?.email;
      } catch (e) {
        console.warn('Could not fetch user emails:', e);
      }
    }

    req.session.user = {
      id: githubUser.id,
      name: githubUser.name || githubUser.login || null,
      email: email || null,
      avatar: githubUser.avatar_url || null,
    };

    // ensure session saved before redirecting
    await new Promise<void>((resolve, reject) =>
      (req.session as any).save((err: any) => (err ? reject(err) : resolve()))
    );

    return res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    console.error('githubCallback error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(`${clientUrl}/auth?error=github`);
  }
};


export const getCurrentUser = (req: Request, res: Response) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
}

export const logout = (req: Request, res: Response) => {
  try {
    req.session.destroy(() => {
      res.clearCookie('sessionId');
      res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('logout error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};