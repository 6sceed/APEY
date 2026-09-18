export type AccountStatus = 'ACTIVE' | 'COOLDOWN' | 'EXPIRED';

export interface Account {
  id: string;
  provider: string;
  email: string;
  gmailUsername?: string;
  gmailPassword?: string;
  apiKey?: string;
  model: string;
  status: AccountStatus;
  resetAt?: string; // ISO date-time timestamp, e.g. "2026-09-19T21:00:00"
  cooldownRemaining?: string;
  expirationDate?: string;
  folderId?: string;
  notes?: string;
  orderIndex?: number;
}

export interface Folder {
  id: string;
  name: string;
  accountCount: number;
}

export interface Burner {
  id: string;
  gmail: string;
  password: string;
  tag: string; // e.g. "1", "A", "Primary"
  tagColor?: string; // e.g. "#22c55e"
  notes?: string;
}
