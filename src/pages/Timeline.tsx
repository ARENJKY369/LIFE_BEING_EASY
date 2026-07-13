import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { format, addMinutes, parse } from 'date-fns';
import { CheckCircle2, Circle, PlayCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Timeline() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tasks = useLiveQuery(() => db.tasks.where('date').equals(today).sortBy('order'));
  const settings = useLiveQuery(() => db.settings.get(1));

  if (!tasks || !settings) return <div className="p-6">Loading...</div>;

  const wakeUpTime = parse(settings.wakeUpTime, 'HH:mm', new Date());
  
  // Calculate running times
  let currentTimeMarker = wakeUpTime;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Today's Timeline</h1>
        <p className="text-[var(--text-muted)]">Your sequence for the day.</p>
      </div>

      <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 pl-8 py-4 space-y-8">
        {tasks.map((task) => {
          const startTime = new Date(currentTimeMarker);
          currentTimeMarker = addMinutes(currentTimeMarker, task.duration);

          const isCompleted = task.status === 'completed';
          const isActive = task.status === 'active';
          const isSkipped = task.status === 'skipped';

          return (
            <div key={task.id} className={clsx("relative", (isCompleted || isSkipped) && "opacity-60")}>
              {/* Timeline dot */}
              <div className="absolute -left-[41px] top-1 bg-[var(--background)] p-1">
                {isCompleted ? <CheckCircle2 size={24} className="text-green-500 fill-green-500/20" /> :
                 isActive ? <PlayCircle size={24} className="text-blue-500 fill-blue-500/20" /> :
                 isSkipped ? <XCircle size={24} className="text-red-500 fill-red-500/20" /> :
                 <Circle size={24} className="text-zinc-300 dark:text-zinc-600" />}
              </div>

              <div className={clsx(
                "bg-[var(--surface)] p-5 rounded-2xl border transition-all",
                isActive ? "border-blue-500 shadow-lg shadow-blue-500/10" : "border-zinc-200 dark:border-zinc-800"
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold">{task.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] capitalize">{task.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{format(startTime, 'h:mm a')}</p>
                    <p className="text-xs text-[var(--text-muted)]">{task.duration} min</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-[var(--text-muted)] italic">No tasks scheduled for today.</div>
        )}
      </div>
    </div>
  );
}
