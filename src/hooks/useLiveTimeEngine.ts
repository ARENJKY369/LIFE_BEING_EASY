import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { format, differenceInMinutes, parse, addMinutes } from 'date-fns';

export function useLiveTimeEngine() {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const today = format(now, 'yyyy-MM-dd');
  // Use stable queries with error handling
  const tasks = useLiveQuery(() => db.tasks.where('date').equals(today).sortBy('order'), [today]) ?? undefined;
  const settings = useLiveQuery(() => db.settings.get(1), []) ?? undefined;

  // While still loading, return undefined to let caller show loading
  if (tasks === undefined || settings === undefined) {
    return undefined; // loading
  }

  if (!settings) {
    // No settings found - return null for caller to handle as needing setup
    return null;
  }

  try {
    const sleepTime = parse(settings.sleepTime, 'HH:mm', now);
    // If sleep time is early morning (e.g., 01:00), it's tomorrow
    if (sleepTime < now && sleepTime.getHours() < 12) {
      sleepTime.setDate(sleepTime.getDate() + 1);
    }

    const completedTasks = (tasks || []).filter(t => t.status === 'completed');
    const remainingTasks = (tasks || []).filter(t => t.status !== 'completed' && t.status !== 'skipped');

    const completedDuration = completedTasks.reduce((acc, t) => acc + t.duration, 0);
    const remainingDuration = remainingTasks.reduce((acc, t) => acc + t.duration, 0);

    const estimatedFinish = addMinutes(now, remainingDuration);
    const hoursLeftBeforeSleep = Math.max(0, differenceInMinutes(sleepTime, now) / 60);
    const freeTimeLeft = Math.max(0, differenceInMinutes(sleepTime, estimatedFinish));

    const currentTask = tasks?.find(t => t.status === 'active');
    const nextTask = remainingTasks.find(t => t.status === 'pending' && t.id !== currentTask?.id);

    // Time metrics by category
    const studyHours = completedTasks.filter(t => t.category === 'learning').reduce((acc, t) => acc + t.duration, 0) / 60;
    
    return {
      currentTime: format(now, 'h:mm a'),
      completedDuration,
      remainingDuration,
      estimatedFinish: format(estimatedFinish, 'h:mm a'),
      freeTimeLeft,
      hoursLeftBeforeSleep,
      completedTasksCount: completedTasks.length,
      totalTasksCount: (tasks || []).length,
      progressPercent: (tasks || []).length === 0 ? 0 : Math.round((completedTasks.length / (tasks || []).length) * 100),
      currentTask,
      nextTask,
      studyHours,
      isDayFinished: remainingTasks.length === 0 && (tasks || []).length > 0
    };
  } catch (e) {
    console.error('useLiveTimeEngine error', e);
    return null;
  }
}
