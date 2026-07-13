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
  }
}

export const db = new LifePlannerDB();
