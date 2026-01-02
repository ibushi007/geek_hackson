import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GitHub APIクライアントのシングルトン
 * セッションからaccess tokenを取得してOctokitインスタンスを生成
 */
export class GitHubClient {
  private octokit: Octokit | null = null;

  /**
   * 認証済みOctokitインスタンスを取得
   */
  async getClient(): Promise<Octokit> {
    if (this.octokit) {
      return this.octokit;
    }

    const session = await getServerSession(authOptions);
    const accessToken = (session as { accessToken?: string })?.accessToken;

    if (!accessToken) {
      throw new Error("GitHub access token not found. Please sign in again.");
    }

    this.octokit = new Octokit({
      auth: accessToken,
      // Rate limit対策: リクエスト間に遅延を入れる
      throttle: {
        onRateLimit: (retryAfter: number, options: any) => {
          console.warn(
            `Request quota exhausted for request ${options.method} ${options.url}`,
          );

          // 3回までリトライ
          if (options.request.retryCount < 3) {
            console.log(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
        },
        onSecondaryRateLimit: (retryAfter: number, options: any) => {
          console.warn(
            `Secondary rate limit hit for request ${options.method} ${options.url}`,
          );
        },
      },
    });

    return this.octokit;
  }

  /**
   * Rate limit情報を取得
   */
  async getRateLimit() {
    try {
      const client = await this.getClient();
      const { data } = await client.rateLimit.get();

      return {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        reset: new Date(data.rate.reset * 1000),
      };
    } catch (error) {
      console.error("Failed to get rate limit:", error);
      throw error;
    }
  }

  /**
   * 認証ユーザー情報を取得（動作確認用）
   */
  async getAuthenticatedUser() {
    try {
      const client = await this.getClient();
      const { data } = await client.users.getAuthenticated();
      return data;
    } catch (error) {
      console.error("Failed to get authenticated user:", error);
      throw error;
    }
  }

  /**
   * クライアントをリセット（再認証が必要な場合）
   */
  reset() {
    this.octokit = null;
  }
}

// シングルトンインスタンス
export const githubClient = new GitHubClient();
