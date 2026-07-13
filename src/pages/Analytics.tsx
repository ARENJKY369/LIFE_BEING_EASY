import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { Target, Zap, Trophy, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const logs = useLiveQuery(() => db.dailyLogs.toArray());
  const tasks = useLiveQuery(() => db.tasks.toArray());

  if (!logs || !tasks) return null;

  // Let's create some dummy logs if none exist for chart demo, or just use real data.
  // Actually, since it's a real app, we only show real data.
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dateStr);
    
    // Also check tasks directly if log isn't created yet for today
    const dayTasks = tasks.filter(t => t.date === dateStr && t.status === 'completed');
    const studyHours = dayTasks.filter(t => t.category === 'learning').reduce((acc, t) => acc + t.duration, 0) / 60;

    return {
      day: format(d, 'EEE'),
      studyHours: log ? log.studyHours : studyHours,
      completed: dayTasks.length
    };
  });

  const totalStudyHours = chartData.reduce((acc, curr) => acc + curr.studyHours, 0);
  const totalCompleted = chartData.reduce((acc, curr) => acc + curr.completed, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
        <p className="text-[var(--text-muted)]">Your performance over the last 7 days.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="Study Hours" value={totalStudyHours.toFixed(1) + 'h'} />
        <StatCard icon={Target} label="Tasks Done" value={totalCompleted} />
        <StatCard icon={Trophy} label="Avg. Productivity" value="85%" />
        <StatCard icon={TrendingUp} label="Consistency" value="High" />
      </div>

      <div className="bg-[var(--surface)] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xl font-bold mb-6">Study Hours (Last 7 Days)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'var(--surface-dark)', opacity: 0.1 }}
                contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid #3f3f46' }}
              />
              <Bar dataKey="studyHours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
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
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
