import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      githubId : string ;
      name: string | null;
      email: string | null;
      avatar: string | null;
    };

    oauthState?: string;
  }
}
