import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubId: string;
      name?: string | null;
      image?: string | null;
    };
    accessToken?: string;
    tokenExpiry?: Date;
  }

  interface User {
    id: string;
    githubId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubId?: string;
    accessToken?: string;
    tokenExpiry?: Date;
  }
}
