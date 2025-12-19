import { githubClient } from "@/lib/github-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// プラグインを有効化
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * コミット情報の型定義
 */
export interface CommitInfo {
  repo: string;
  message: string;
  sha: string;
  additions: number;
  deletions: number;
  url: string;
  date: string;
}

/**
 * コミット統計の型定義
 */
export interface CommitStats {
  commitCount: number;
  linesAdded: number;
  linesDeleted: number;
  linesChanged: number;
  repositories: string[];
  commits: CommitInfo[];
}

/**
 * PR情報の型定義
 */
export interface PullRequestInfo {
  repo: string;
  title: string;
  number: number;
  state: string;
  merged: boolean;
  body: string | null;
  url: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: string;
  mergedAt: string | null;
}

/**
 * PR統計の型定義
 */
export interface PullRequestStats {
  prCount: number;
  mergedCount: number;
  reviewCount: number;
  pullRequests: PullRequestInfo[];
}

/**
 * 技術タグの型定義
 */
export interface TechTag {
  name: string;
  isNew: boolean;
}

/**
 * GitHub API経由でデータを取得するサービス
 */
export class GitHubService {
  /**
   * タイムゾーンを考慮した日付範囲取得
   * @param date - YYYY-MM-DD形式の日付
   * @param timeZone - タイムゾーン（デフォルト: Asia/Tokyo）
   * @returns 開始日時と終了日時
   */
  private getDateRange(
    date: string,
    timeZone: string = "Asia/Tokyo",
  ): { start: Date; end: Date } {
    const startOfDay = dayjs.tz(date, timeZone).startOf("day");
    const endOfDay = dayjs.tz(date, timeZone).endOf("day");

    return {
      start: startOfDay.toDate(),
      end: endOfDay.toDate(),
    };
  }

  /**
   * 指定日のコミット情報を取得
   * @param username - GitHubユーザー名
   * @param date - 対象日（YYYY-MM-DD形式）
   * @returns コミット統計情報
   */
  async getCommitsByDateRange(
    username: string,
    date: string,
  ): Promise<CommitStats> {
    try {
      const client = await githubClient.getClient();
      const { start, end } = this.getDateRange(date);

      console.log(`📅 Fetching commits for ${date} (JST)`);
      console.log(
        `  ⏰ ${start.toLocaleString("ja-JP")} ~ ${end.toLocaleString("ja-JP")}`,
      );

      // ユーザーのすべてのリポジトリを取得
      const { data: repos } = await client.repos.listForAuthenticatedUser({
        visibility: "all",
        sort: "updated",
        per_page: 100,
      });

      let totalCommits = 0;
      let totalAdditions = 0;
      let totalDeletions = 0;
      const commitDetails: CommitInfo[] = [];
      const reposWithCommits = new Set<string>();

      // 各リポジトリのコミットを取得
      for (const repo of repos) {
        try {
          const { data: commits } = await client.repos.listCommits({
            owner: repo.owner.login,
            repo: repo.name,
            author: username,
            since: start.toISOString(),
            until: end.toISOString(),
            per_page: 100,
          });

          if (commits.length === 0) continue;

          // マージコミットを除外（parentsが2つ以上のコミット）
          const regularCommits = commits.filter((commit) => {
            const isMergeCommit = (commit.parents?.length || 0) > 1;
            if (isMergeCommit) {
              console.log(
                `⏭️  Skipping merge commit: ${commit.commit.message.split("\n")[0]}`,
              );
            }
            return !isMergeCommit;
          });

          console.log(
            `📝 Repository ${repo.name}: ${commits.length} commits (${regularCommits.length} regular, ${commits.length - regularCommits.length} merge)`,
          );

          // 各コミットの詳細情報を取得
          for (const commit of regularCommits) {
            const { data: commitDetail } = await client.repos.getCommit({
              owner: repo.owner.login,
              repo: repo.name,
              ref: commit.sha,
            });

            const additions = commitDetail.stats?.additions || 0;
            const deletions = commitDetail.stats?.deletions || 0;

            totalCommits++;
            totalAdditions += additions;
            totalDeletions += deletions;
            reposWithCommits.add(repo.full_name);

            commitDetails.push({
              repo: repo.full_name,
              message: commit.commit.message.split("\n")[0], // 最初の行のみ
              sha: commit.sha,
              additions,
              deletions,
              url: commit.html_url,
              date: commit.commit.author?.date || "",
            });
          }
        } catch (error) {
          // リポジトリごとのエラーは警告のみ
          console.warn(
            `⚠️  Failed to fetch commits for ${repo.full_name}:`,
            error,
          );
          continue;
        }
      }

      console.log(
        `✅ Found ${totalCommits} commits in ${reposWithCommits.size} repositories`,
      );

      return {
        commitCount: totalCommits,
        linesAdded: totalAdditions,
        linesDeleted: totalDeletions,
        linesChanged: totalAdditions + totalDeletions,
        repositories: Array.from(reposWithCommits),
        commits: commitDetails,
      };
    } catch (error) {
      console.error("❌ Failed to fetch commits:", error);
      throw new Error("コミット情報の取得に失敗しました");
    }
  }

  /**
   * 指定日のPR情報を取得
   * @param username - GitHubユーザー名
   * @param date - 対象日（YYYY-MM-DD形式）
   * @returns PR統計情報
   */
  async getPullRequestsByDateRange(
    username: string,
    date: string,
  ): Promise<PullRequestStats> {
    try {
      const client = await githubClient.getClient();

      console.log(`📋 Fetching pull requests for ${date}`);

      // GitHub Search APIを使用してPRを検索
      const query = `author:${username} type:pr created:${date}`;

      const { data: searchResult } = await client.search.issuesAndPullRequests({
        q: query,
        per_page: 100,
        sort: "created",
      });

      let mergedCount = 0;
      let reviewCount = 0;
      const prDetails: PullRequestInfo[] = [];

      // 各PRの詳細情報を取得
      for (const issue of searchResult.items) {
        const urlParts = issue.repository_url.split("/");
        const owner = urlParts[urlParts.length - 2];
        const repo = urlParts[urlParts.length - 1];

        try {
          const { data: pr } = await client.pulls.get({
            owner,
            repo,
            pull_number: issue.number,
          });

          if (pr.merged) mergedCount++;

          // レビュー数を取得
          const { data: reviews } = await client.pulls.listReviews({
            owner,
            repo,
            pull_number: issue.number,
          });
          reviewCount += reviews.length;

          prDetails.push({
            repo: `${owner}/${repo}`,
            title: pr.title,
            number: pr.number,
            state: pr.state,
            merged: pr.merged || false,
            body: pr.body,
            url: pr.html_url,
            additions: pr.additions || 0,
            deletions: pr.deletions || 0,
            changedFiles: pr.changed_files || 0,
            createdAt: pr.created_at,
            mergedAt: pr.merged_at,
          });
        } catch (error) {
          console.warn(`⚠️  Failed to fetch PR #${issue.number}:`, error);
          continue;
        }
      }

      console.log(`✅ Found ${searchResult.total_count} pull requests`);

      return {
        prCount: searchResult.total_count,
        mergedCount,
        reviewCount,
        pullRequests: prDetails,
      };
    } catch (error) {
      console.error("❌ Failed to fetch pull requests:", error);
      throw new Error("PR情報の取得に失敗しました");
    }
  }

  /**
   * ファイル拡張子から技術タグへのマッピング
   */
  private readonly extensionToTech: Record<string, string> = {
    // フロントエンド
    ".tsx": "React (TypeScript)",
    ".ts": "TypeScript",
    ".jsx": "React",
    ".js": "JavaScript",
    ".vue": "Vue.js",
    ".svelte": "Svelte",

    // スタイル
    ".css": "CSS",
    ".scss": "SCSS",
    ".sass": "Sass",
    ".less": "Less",

    // バックエンド
    ".py": "Python",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".kt": "Kotlin",
    ".rb": "Ruby",
    ".php": "PHP",
    ".cs": "C#",

    // モバイル
    ".swift": "Swift",
    ".dart": "Dart (Flutter)",

    // データベース
    ".sql": "SQL",
    ".prisma": "Prisma",

    // 設定ファイル
    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".toml": "TOML",
    ".md": "Markdown",
  };

  /**
   * コミットから使用技術を抽出
   * @param commits - コミット情報の配列
   * @param userId - ユーザーID（過去の技術スタック取得用）
   * @returns 技術タグの配列
   */
  async analyzeTechStack(
    commits: CommitInfo[],
    userId: string,
  ): Promise<TechTag[]> {
    try {
      const client = await githubClient.getClient();
      const techSet = new Set<string>();

      console.log(`🔍 Analyzing tech stack from ${commits.length} commits`);

      // 各コミットの変更ファイルを取得
      for (const commit of commits) {
        try {
          const [owner, repo] = commit.repo.split("/");

          const { data: commitDetail } = await client.repos.getCommit({
            owner,
            repo,
            ref: commit.sha,
          });

          // 変更されたファイルの拡張子を抽出
          commitDetail.files?.forEach((file) => {
            const ext = this.getFileExtension(file.filename);
            const tech = this.extensionToTech[ext];
            if (tech) {
              techSet.add(tech);
            }
          });
        } catch (error) {
          console.warn(`⚠️  Failed to analyze commit ${commit.sha}:`, error);
          continue;
        }
      }

      // 過去の日報から使用した技術を取得
      const pastTechs = await this.getPastTechTags(userId);

      // 新規技術かどうかを判定
      const techTags = Array.from(techSet).map((tech) => ({
        name: tech,
        isNew: !pastTechs.includes(tech),
      }));

      console.log(
        `✅ Found ${techTags.length} technologies (${techTags.filter((t) => t.isNew).length} new)`,
      );

      return techTags;
    } catch (error) {
      console.error("❌ Failed to analyze tech stack:", error);
      return [];
    }
  }

  /**
   * ファイル名から拡張子を取得
   */
  private getFileExtension(filename: string): string {
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0] : "";
  }

  /**
   * 過去の日報から使用した技術タグを取得
   */
  private async getPastTechTags(userId: string): Promise<string[]> {
    try {
      const { prisma } = await import("@/lib/prisma");

      const reports = await prisma.dailyReport.findMany({
        where: { userId },
        select: { techTags: true },
      });

      const allTechs = new Set<string>();

      reports.forEach((report) => {
        if (report.techTags && Array.isArray(report.techTags)) {
          (report.techTags as Array<{ name: string }>).forEach((tag) => {
            allTechs.add(tag.name);
          });
        }
      });

      return Array.from(allTechs);
    } catch (error) {
      console.error("⚠️  Failed to get past tech tags:", error);
      return [];
    }
  }

  /**
   * PR要約を生成
   * @param pullRequests - PR情報の配列
   * @param commits - コミット情報の配列
   * @returns 要約文
   */
  generatePRSummary(
    pullRequests: PullRequestInfo[],
    commits: CommitInfo[],
  ): string {
    if (pullRequests.length === 0) {
      // PRがない場合はコミットから要約
      if (commits.length === 0) {
        return "本日の活動なし";
      }

      // 重複を除いてユニークなメッセージのみ取得
      const uniqueMessages = Array.from(
        new Set(commits.map((c) => c.message)),
      );

      if (uniqueMessages.length === 1) {
        return uniqueMessages[0];
      }

      return (
        "本日のコミット:\n" +
        uniqueMessages.slice(0, 3).map((msg) => `- ${msg}`).join("\n")
      );
    }

    const mainPR = pullRequests[0];
    let summary = mainPR.title;

    // 本文が有意義な場合のみ追加（タイトルと異なり、10文字以上）
    if (
      mainPR.body &&
      mainPR.body.length > 10 &&
      mainPR.body !== mainPR.title
    ) {
      summary += `\n\n${mainPR.body}`;
    }

    // 複数PRの場合
    if (pullRequests.length > 1) {
      summary += `\n\n他のPR:\n`;
      pullRequests.slice(1, 3).forEach((pr) => {
        summary += `- ${pr.title}\n`;
      });

      if (pullRequests.length > 3) {
        summary += `... 他 ${pullRequests.length - 3}件`;
      }
    }

    return summary;
  }
}

// シングルトンインスタンス
export const githubService = new GitHubService();
