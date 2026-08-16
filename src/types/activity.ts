export type ActivityType = 'view' | 'favorite';

export interface ActivityLogRow {
  id: string;
  user_id: string;
  type: ActivityType;
  ticker: string;
  company_name: string;
  created_at: string;
}
