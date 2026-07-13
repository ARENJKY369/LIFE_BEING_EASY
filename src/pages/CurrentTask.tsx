import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '../db/db';
import { format } from 'date-fns';
import { Play, Pause, CheckCircle2, SkipForward, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function CurrentTask() {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const tasks = useLiveQuery(() => db.tasks.where('date').equals(today).sortBy('order'));

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [nextTask, setNextTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!tasks) return;
    
    let current = tasks.find(t => t.status === 'active');
    const pending = tasks.filter(t => t.status === 'pending');
    
    // If no active task but there are pending ones, we don't auto-start, we wait for user to start
    // but we can set the 'next' task ready to be started
    if (!current && pending.length > 0) {
      setNextTask(pending[0]);
    } else {
      setNextTask(pending.find(t => t.id !== current?.id) || null);
    }

    if (current && (!activeTask || activeTask.id !== current.id)) {
      setActiveTask(current);
      setTimeLeft(current.duration * 60);
      setIsRunning(true);
    } else if (!current) {
      setActiveTask(null);
      setTimeLeft(0);
      setIsRunning(false);
    }
  }, [tasks, activeTask]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play a sound? Or show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Time is up!', { body: `Finished: ${activeTask?.title}` });
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, activeTask]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const handleStartNext = async () => {
    if (!nextTask) return;
    requestNotificationPermission();
    await db.tasks.update(nextTask.id!, { status: 'active' });
  };

  const handleComplete = async () => {
    if (!activeTask) return;
    await db.tasks.update(activeTask.id!, { status: 'completed' });
    
    // Update Rule states if applicable
    if (activeTask.category === 'learning' || activeTask.category === 'revision') {
      const subjectName = activeTask.subject || (activeTask.category === 'revision' ? 'revision' : '');
      if (subjectName) {
        await db.ruleStates.put({ id: subjectName, lastCompletedDate: today });
      }
    } else if (activeTask.category === 'fitness') {
      await db.ruleStates.put({ id: 'fitness', lastCompletedDate: today });
    }

    // Auto switch to next task
    if (nextTask) {
      await db.tasks.update(nextTask.id!, { status: 'active' });
    }
  };

  const handleSkip = async () => {
    if (!activeTask) return;
    // Skip pushes it to the end of the day or just marks skipped. Specification: "Move skipped tasks automatically"
    // Let's mark it 'skipped' but duplicate it at the end of the day's order?
    // "Move skipped tasks automatically." Let's push it to tomorrow, or just mark skipped and free up time. 
    // Let's mark it 'skipped'.
    await db.tasks.update(activeTask.id!, { status: 'skipped' });
    if (nextTask) {
      await db.tasks.update(nextTask.id!, { status: 'active' });
    }
  };

  if (!tasks) return null;

  if (!activeTask && !nextTask) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div>
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">All Caught Up!</h1>
          <p className="text-[var(--text-muted)] mb-6">You have completed all scheduled tasks for today.</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-[var(--text)] text-[var(--background)] rounded-xl font-medium">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!activeTask && nextTask) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <span className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4 block">Up Next</span>
          <h2 className="text-3xl font-bold mb-2">{nextTask.title}</h2>
          <p className="text-[var(--text-muted)] mb-8 capitalize">{nextTask.category} • {nextTask.duration} minutes</p>
          <button 
            onClick={handleStartNext}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
          >
            <Play size={20} className="fill-current" /> Start Task
          </button>
        </div>
      </div>
    );
  }

  // Active Task View
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((activeTask!.duration * 60 - timeLeft) / (activeTask!.duration * 60)) * 100;

  return (
    <div className="min-h-full flex flex-col p-6 max-w-3xl mx-auto py-12 md:py-20">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div 
          key={activeTask!.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-[var(--surface)] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 md:p-12 text-center relative overflow-hidden"
        >
          {/* Progress Background */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-blue-500/10 transition-all duration-1000 ease-linear"
            style={{ height: `${progress}%` }}
          />

          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-500 font-bold text-sm uppercase tracking-wider mb-6">
              {activeTask!.category}
            </span>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{activeTask!.title}</h1>
            {activeTask!.subject && <p className="text-xl text-[var(--text-muted)] mb-8">{activeTask!.subject}</p>}

            {/* Timer */}
            <div className="relative flex items-center justify-center mb-12 py-8">
              {isRunning && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-blue-500 rounded-full blur-3xl pointer-events-none"
                />
              )}
              <div className="font-mono text-7xl md:text-9xl font-light tracking-tighter tabular-nums relative z-10">
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className="w-20 h-20 rounded-full bg-[var(--text)] text-[var(--background)] flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isRunning ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-2" />}
              </button>

              <button 
                onClick={handleComplete}
                className="px-8 py-5 rounded-2xl bg-green-500 text-white font-bold text-lg flex items-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
              >
                <CheckCircle2 size={24} /> Complete
              </button>

              <button 
                onClick={handleSkip}
                className="px-6 py-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[var(--text)] font-medium flex items-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <SkipForward size={20} /> Skip
              </button>
            </div>
          </div>
        </motion.div>

        {/* Up Next Teaser */}
        {nextTask && (
          <div className="mt-8 text-center text-[var(--text-muted)] flex items-center justify-center gap-2">
            <span className="text-sm font-medium">Up Next: {nextTask.title}</span>
            <ArrowRight size={16} />
          </div>
        )}
      </div>
    </div>
  );
}
