import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { 
    prisma: PrismaClient | undefined 
};

function getPrisma() {
    if (!globalForPrisma.prisma) {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is not set in environment variables!");
        }
        globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
}

export const authOptions = {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account?.provider === "github" && profile) {
                //github認証成功時の処理→userテーブルにデータを保存
                try{
                    const prisma = getPrisma();
                    await prisma.user.upsert({
                        where: { githubId: profile.login as string },
                        update: {
                            name: profile.name || null,
                            avatarUrl: profile.avatar_url || null,
                        },
                        create: {
                            githubId: profile.login as string,
                            name: profile.name || null,
                            avatarUrl: profile.avatar_url || null,
                        },
                    });
                } catch (error) {
                    console.error("GitHub認証ユーザー保存エラー:", error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }: any) {
            if (session.user && token.sub) {
                const prisma = getPrisma();
                const user = await prisma.user.findUnique({
                    where: { githubId: token.sub },
                });
                if (user) {
                    session.user.id = user.id;
                    session.user.githubId = user.githubId;
                }
            }
            return session;
        },
        async jwt({ token, account, profile }: any) {
            if (account && profile) {
                token.githubId = profile.login;
            }
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };