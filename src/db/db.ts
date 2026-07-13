import Dexie, { type Table } from 'dexie';

export interface UserSettings {
  id: number; // Single row, id = 1
  wakeUpTime: string; // '07:00'
  sleepTime: string; // '23:00'
  learningGoals: string[];
  fitnessGoal: string;
  weeklyRestDay: number; // 0-6 (0 = Sunday)
  studySessionLength: number; // in minutes
  breakLength: number; // in minutes
  isSetupComplete: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface Task {
  id?: string;
  title: string;
  category: 'learning' | 'fitness' | 'other' | 'break' | 'revision';
  subject?: string;
  duration: number; // in minutes
  dueDate?: string; // YYYY-MM-DD
  status: 'pending' | 'active' | 'completed' | 'skipped';
  order: number; // Position in today's sequence
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  studyHours: number;
  fitnessDone: boolean;
  tasksCompleted: number;
  productivityScore: number;
  reflection: string;
}

export interface RuleState {
  id: string; // 'last_dsa', 'last_bug_bounty', etc.
  lastCompletedDate: string; // YYYY-MM-DD
}

export class LifePlannerDB extends Dexie {
  settings!: Table<UserSettings, number>;
  tasks!: Table<Task, string>;
  dailyLogs!: Table<DailyLog, string>;
  ruleStates!: Table<RuleState, string>;

  constructor() {
    super('LifePlannerDB');
    this.version(1).stores({
      settings: 'id',
      tasks: 'id, date, status, category',
      dailyLogs: 'date',
      ruleStates: 'id'
    });

    // Handle blocked upgrade - common cause of hang on some browsers
    this.on('blocked', () => {
      console.warn('LifePlannerDB blocked - close other tabs with this app');
    });
  }
}

export const db = new LifePlannerDB();

// Utility: check IndexedDB availability (fails in some private mode / Firefox)
export function isIndexedDBAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    if (!window.indexedDB) return false;
    // Safari private mode test
    const testKey = '__idb_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Ensure DB can open - returns promise that rejects quickly if blocked
export async function ensureDBReady(timeoutMs = 5000): Promise<void> {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB is not available in this browser context. Disable private mode and allow storage.');
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('IndexedDB open timeout - storage may be blocked')), timeoutMs)
  );

  await Promise.race([db.open(), timeout]);
}

// Safe reset for when user stuck on loading screen
export async function resetDB(): Promise<void> {
  try {
    await db.delete();
    localStorage.clear();
    sessionStorage.clear();
    // Re-open fresh
    await db.open();
  } catch (e) {
    console.error('resetDB failed', e);
    // Force hard reload clearing
    localStorage.clear();
  }
}
