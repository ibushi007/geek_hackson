import NextAuth, { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

// GitHub固有のprofile型
interface GitHubProfile {
  login: string;
  name?: string;
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
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as GitHubProfile;
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
      const githubId = token.githubId as string | undefined;
      if (session.user && githubId) {
        try {
          const user = await prisma.user.findUnique({
            where: { githubId },
          });
          if (user) {
            (session.user as { id?: string; githubId?: string }).id = user.id;
            (session.user as { id?: string; githubId?: string }).githubId =
              user.githubId;
          }
        } catch (error) {
          console.error("セッション取得エラー:", error);
        }
      }
      if (token.accessToken) {
        (session as { accessToken?: string }).accessToken =
          token.accessToken as string;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const githubProfile = profile as GitHubProfile;
        token.githubId = githubProfile.login;
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
