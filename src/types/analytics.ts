export interface DailyStats {
  date: string
  plays: number
}

export interface HourlyHeatmap {
  day: number
  hour: number
  plays: number
}

export interface DashboardSummary {
  stallCount?: number
  todayPlays: number
  weekPlays: number
  monthPlays: number
  activePoiCount: number
  pendingApprovals?: number
  totalPlays?: number
}

export interface DailySeriesPoint {
  date: string
  plays: number
}

export interface LanguageBreakdownItem {
  name: string
  count: number
}

export interface PlaybackLogItem {
  id: string
  poiId: string
  poiName?: string
  language: string
  duration: number
  playedAt: string
}

export interface AnalyticsSummary {
  totalPlays: number
  averageDurationSeconds: number
  uniqueVisitors: number
  uniqueLanguages?: number
}
