export enum EditorMode {
  EDIT = 'EDIT',
  PREVIEW = 'PREVIEW',
  SPLIT = 'SPLIT'
}

export interface GeneratedResponse {
  html: string;
  explanation?: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  html: string;
  note?: string;
}

export interface Player {
  id: string;
  name: string;
  history: HistoryEntry[];
  updatedAt: number;
}
