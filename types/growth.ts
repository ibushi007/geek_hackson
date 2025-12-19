export type WeeklyCommits = {
  dayOfWeek: string;
  value: number;
  dateKey: string; // YYYY-MM-DD
}[];

export type GrowthData = {
  weeklyCommits: WeeklyCommits;
  streak: number;
  momentum: number;
};
