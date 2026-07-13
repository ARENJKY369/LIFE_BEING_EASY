import { Link } from 'react-router-dom';
import { useLiveTimeEngine } from '../hooks/useLiveTimeEngine';
import { Play, CheckCircle, Clock, BatteryCharging, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const engine = useLiveTimeEngine();

  if (!engine) return <div className="p-6">Loading engine...</div>;

  const {
    currentTime,
    completedDuration,
    remainingDuration,
    estimatedFinish,
    freeTimeLeft,
    completedTasksCount,
    totalTasksCount,
    progressPercent,
    currentTask,
    nextTask,
    isDayFinished
  } = engine;

  // Format minutes helper
  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[var(--text-muted)] font-medium mb-1">Current Time</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{currentTime}</h1>
        </div>
        <div className="text-right">
          <p className="text-[var(--text-muted)] font-medium mb-1">Today's Progress</p>
          <div className="flex items-center gap-3">
            <div className="w-32 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
            <span className="font-bold">{progressPercent}%</span>
          </div>
        </div>
      </header>

      {/* Motivational / Status Banner */}
      {isDayFinished ? (
        <div className="p-8 rounded-3xl bg-green-500/10 border border-green-500/20 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 text-white rounded-full"><CheckCircle size={32} /></div>
            <div>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">Congratulations!</h3>
              <p className="text-green-600/80 dark:text-green-400/80 text-lg">You have completed all tasks for today.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-[var(--surface)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-sm text-[var(--text-muted)]">Study Hours</span>
              <p className="text-xl font-bold">{engine.studyHours.toFixed(1)}h</p>
            </div>
            <div className="bg-[var(--surface)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-sm text-[var(--text-muted)]">Tasks Completed</span>
              <p className="text-xl font-bold">{completedTasksCount}</p>
            </div>
            <div className="bg-[var(--surface)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-sm text-[var(--text-muted)]">Free Time</span>
              <p className="text-xl font-bold">{formatMins(freeTimeLeft)}</p>
            </div>
            <div className="bg-[var(--surface)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-sm text-[var(--text-muted)]">Productivity</span>
              <p className="text-xl font-bold">100%</p>
            </div>
          </div>
        </div>
      ) : totalTasksCount === 0 ? (
        <div className="p-8 rounded-3xl bg-[var(--surface)] border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-zinc-200/5 dark:shadow-none">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">System Idling</h3>
            <p className="text-[var(--text-muted)] text-lg">Initialize your day by running the Schedule Engine.</p>
          </div>
          <Link to="/plan" className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
            <Zap size={20} className="fill-white" /> Run Engine
          </Link>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-blue-500 text-white flex items-center justify-between shadow-lg shadow-blue-500/20">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2"><Zap size={20} className="fill-white" /> Keep Going</h3>
            <p className="opacity-90 mt-1">You have {totalTasksCount - completedTasksCount} tasks left. Finish by {estimatedFinish}.</p>
          </div>
        </div>
      )}

      {/* Time Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Completed" value={formatMins(completedDuration)} />
        <StatCard icon={BatteryCharging} label="Remaining" value={formatMins(remainingDuration)} />
        <StatCard icon={CheckCircle} label="Estimated Finish" value={estimatedFinish} />
        <StatCard icon={Zap} label="Free Time Left" value={formatMins(freeTimeLeft)} />
      </div>

      {/* Current / Next Task Area */}
      {totalTasksCount > 0 && !isDayFinished && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Task */}
          <div className="bg-[var(--surface)] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">Active Now</span>
              <span className="text-[var(--text-muted)] text-sm">{currentTask ? `${currentTask.duration} min` : ''}</span>
            </div>
            
            {currentTask ? (
              <>
                <h2 className="text-2xl font-bold mb-2">{currentTask.title}</h2>
                <p className="text-[var(--text-muted)] capitalize mb-6">{currentTask.category}</p>
                <div className="mt-auto">
                  <Link to="/active" className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--text)] text-[var(--background)] rounded-xl font-medium hover:opacity-90 transition-opacity">
                    <Play size={18} className="fill-current" /> Open Focus Screen
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-[var(--text-muted)]">
                  <Clock size={24} />
                </div>
                <p className="text-[var(--text-muted)] font-medium">Ready for the next task?</p>
                {nextTask && (
                  <Link to="/active" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">Start {nextTask.title}</Link>
                )}
              </div>
            )}
          </div>

          {/* Next Task Preview */}
          <div className="bg-[var(--surface)] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col shadow-sm opacity-80">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">Up Next</span>
            </div>
            {nextTask ? (
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-xl font-bold text-[var(--text-muted)] mb-1">{nextTask.title}</h2>
                <p className="text-sm text-[var(--text-muted)] capitalize">{nextTask.category} • {nextTask.duration} min</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
                No more tasks for today!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Icon size={16} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
