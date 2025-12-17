export type TechTag = {
  name: string;
  isNew: boolean;
}

export type CreateReportInput = {
  title: string;
  todayLearning: string;
  struggles?: string;
  tomorrow?: string;
  githubUrl: string;
  prCount: number;
  commitCount: number;
  linesChanged: number;
  changeSize: string;
  prSummary: string;
  aiCoachComment?: string;
  techTags?: TechTag[];
};

export type ReportResponse = {
  id: string;
  userId: string;
  createdAt: Date;
  title: string;
  todayLearning: string;
  struggles?: string | null;
  tomorrow?: string | null;
  githubUrl: string;
  prCount: number;
  commitCount: number;
  linesChanged: number;
  changeSize: string;
  prSummary: string;
  aiCoachComment?: string | null;
  techTags?: TechTag[] | null;
};

export type ShowReportsResponse = {
  reports: ReportResponse[];
};
