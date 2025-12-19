export type WeeklyCommits = {
    dayOfWeek: string;
    value: number;
    isToday: boolean;
}[]

export type GrowthData = {
    weeklyCommits: WeeklyCommits;
    streak: number;
    momentum: number;
}
