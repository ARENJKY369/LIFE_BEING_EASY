import { db, type Task, type UserSettings } from '../db/db';
import { format, differenceInDays } from 'date-fns';

export interface DailyInput {
  availableHours: number;
  energyLevel: 'high' | 'medium' | 'low';
  urgentTasks: { title: string; duration: number }[];
  fixedEvents: { title: string; time: string; duration: number }[];
}

export async function generateSchedule(input: DailyInput, settings: UserSettings) {
  const today = format(new Date(), 'yyyy-MM-dd');

  // Check if schedule already exists
  const existingTasks = await db.tasks.where('date').equals(today).toArray();
  if (existingTasks.length > 0) {
    return existingTasks;
  }

  let remainingMinutes = input.availableHours * 60;
  const newTasks: Omit<Task, 'id'>[] = [];
  let orderIndex = 0;

  const addTask = (task: Omit<Task, 'id' | 'order' | 'date' | 'createdAt' | 'status'>) => {
    if (remainingMinutes < task.duration && task.category !== 'other' && task.category !== 'fitness') {
      // If we don't have time, skip it unless it's mandatory
      return false;
    }
    
    newTasks.push({
      ...task,
      status: 'pending',
      order: orderIndex++,
      date: today,
      createdAt: Date.now()
    });
    remainingMinutes -= task.duration;
    return true;
  };

  // 1. Add Fixed Events & Urgent Works (Other)
  for (const event of input.fixedEvents) {
    addTask({
      title: event.title,
      category: 'other',
      duration: event.duration
    });
  }
  for (const urgent of input.urgentTasks) {
    addTask({
      title: urgent.title,
      category: 'other',
      duration: urgent.duration
    });
  }

  // 2. Fitness every day
  // Check if it's rest day? "Fitness every day" is the rule, maybe gentle on rest day.
  addTask({
    title: 'Fitness: ' + settings.fitnessGoal,
    category: 'fitness',
    duration: 60 // Defaulting fitness to 60 mins or based on input string? Let's use 60.
  });

  // 3. Revision every day
  addTask({
    title: 'Daily Revision',
    category: 'revision',
    duration: 30
  });

  // 4. Learning Goals
  // Rule: Never ignore DSA > 2 days, Bug Bounty > 2 days.
  // Let's get rule states
  const ruleStates = await db.ruleStates.toArray();
  const getDaysSince = (id: string) => {
    const rule = ruleStates.find(r => r.id === id);
    if (!rule) return 999;
    return differenceInDays(new Date(), new Date(rule.lastCompletedDate));
  };

  const prioritizedGoals = [...settings.learningGoals];
  
  // Custom logic for DSA and Bug Bounty
  if (prioritizedGoals.includes('DSA') && getDaysSince('DSA') >= 2) {
    prioritizedGoals.sort((a) => a === 'DSA' ? -1 : 0);
  } else if (prioritizedGoals.includes('Bug Bounty') && getDaysSince('Bug Bounty') >= 2) {
    prioritizedGoals.sort((a) => a === 'Bug Bounty' ? -1 : 0);
  } else {
    // Shuffle or rotate subjects
    prioritizedGoals.sort(() => Math.random() - 0.5);
  }

  // Energy level dictates study session length or quantity
  let sessionLen = settings.studySessionLength;
  if (input.energyLevel === 'low') sessionLen = Math.max(30, sessionLen - 20);
  if (input.energyLevel === 'high') sessionLen = sessionLen + 10;

  for (const goal of prioritizedGoals) {
    if (remainingMinutes < sessionLen) break;
    
    const added = addTask({
      title: `Study: ${goal}`,
      category: 'learning',
      subject: goal,
      duration: sessionLen
    });

    if (added) {
      addTask({
        title: 'Break',
        category: 'break',
        duration: settings.breakLength
      });
    }
  }

  // Save to DB
  for (const task of newTasks) {
    await db.tasks.add({ ...task, id: crypto.randomUUID() } as Task);
  }

  return newTasks;
}
