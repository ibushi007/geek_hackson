import NextAuth, { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import type { Account, Profile } from "next-auth";
import type { JWT } from "next-auth/jwt";

// 拡張した型定義
interface ExtendedSession {
  user?: {
    id?: string;
    githubId?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  accessToken?: string;
}

interface ExtendedToken extends JWT {
  githubId?: string;
  accessToken?: string;
}

interface GitHubProfile extends Profile {
  login: string;
  avatar_url?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user repo",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      const githubProfile = profile as GitHubProfile | undefined;
      if (account?.provider === "github" && githubProfile) {
        try {
          await prisma.user.upsert({
            where: { githubId: githubProfile.login },
            update: {
              name: githubProfile.name || null,
              avatarUrl: githubProfile.avatar_url || null,
            },
            create: {
              githubId: githubProfile.login,
              name: githubProfile.name || null,
              avatarUrl: githubProfile.avatar_url || null,
            },
          });
        } catch (error) {
          console.error("GitHub認証ユーザー保存エラー:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      const extendedToken = token as ExtendedToken;

      if (extendedSession.user && extendedToken.githubId) {
        try {
          const user = await prisma.user.findUnique({
            where: { githubId: extendedToken.githubId },
          });
          if (user) {
            extendedSession.user.id = user.id;
            extendedSession.user.githubId = user.githubId;
          }
        } catch (error) {
          console.error("セッション取得エラー:", error);
        }
      }
      if (extendedToken.accessToken) {
        extendedSession.accessToken = extendedToken.accessToken;
      }
      return extendedSession;
    },
    async jwt({ token, account, profile }) {
      const extendedToken = token as ExtendedToken;
      const githubProfile = profile as GitHubProfile | undefined;

      if (account && githubProfile) {
        extendedToken.githubId = githubProfile.login;
        extendedToken.accessToken = account.access_token;
      }
      return extendedToken;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
