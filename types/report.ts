export type CreateReportInput = {
  workDurationSec?: number;
  githubUrl: string;
  dailyNote: string;
  diffCount: string;
  aiScore: number;
  aiGoodPoints: string;
  aiBadPoints: string;
  aiStudyTime?: string;
};

export type ReportResponse = {
  id: string;
  createdAt: Date;
  workDurationSec: number | null;
  githubUrl: string;
  aiScore: number;
  aiGoodPoints: string;
  aiBadPoints: string;
  aiStudyTime: string | null;
};

export type ShowReportsResponse = {
  reports: Array<{
    id: string;
    createdAt: string; // ISO 8601形式
    workDurationSec: number | null;
    githubUrl: string;
    aiScore: number;
    aiGoodPoints: string;
    aiBadPoints: string;
    aiStudyTime: string | null;
  }>;
};
