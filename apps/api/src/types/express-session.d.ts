import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      name: string;
      email: string;
      avatar: string;
    };
    // store oauth state for CSRF protection during OAuth flow
    oauthState?: string;
  }
}
