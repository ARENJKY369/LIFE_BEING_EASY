import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { generateSchedule, type DailyInput } from '../utils/scheduleEngine';
import { format } from 'date-fns';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Zap, Clock, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DailyPlanner() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const todayTasks = useLiveQuery(() => db.tasks.where('date').equals(format(new Date(), 'yyyy-MM-dd')).sortBy('order'));
  const navigate = useNavigate();

  const { register, control, handleSubmit } = useForm<DailyInput>({
    defaultValues: {
      availableHours: 8,
      energyLevel: 'medium',
      urgentTasks: [],
      fixedEvents: []
    }
  });

  const { fields: urgentFields, append: appendUrgent, remove: removeUrgent } = useFieldArray({ control, name: 'urgentTasks' });
  const { fields: fixedFields, append: appendFixed, remove: removeFixed } = useFieldArray({ control, name: 'fixedEvents' });

  const [generating, setGenerating] = useState(false);

  if (settings === undefined || todayTasks === undefined) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
          <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-zinc-500 mb-4">Setup required</p>
        <button onClick={() => navigate('/setup')} className="px-6 py-3 bg-blue-600 text-white rounded-xl">Go Setup</button>
      </div>
    );
  }

  const hasPlan = todayTasks && todayTasks.length > 0;

  const onSubmit = async (data: DailyInput) => {
    setGenerating(true);
    setTimeout(async () => {
      await generateSchedule(data, settings);
      setGenerating(false);
    }, 1000); // Artificial delay for animation
  };

  if (hasPlan) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Today's Plan</h1>
            <p className="text-[var(--text-muted)] mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium">Go to Dashboard</button>
        </div>

        <div className="space-y-3">
          {todayTasks.map((task) => (
            <div key={task.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[var(--surface)] flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="font-semibold text-lg">{task.title}</span>
                <span className="text-sm text-[var(--text-muted)] capitalize">{task.category} • {task.duration} min</span>
              </div>
              <div className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium capitalize">
                {task.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Good Morning</h1>
        <p className="text-[var(--text-muted)] mt-2">Let's plan your day. The OS will handle the rest.</p>
      </div>

      <AnimatePresence mode="wait">
        {generating ? (
          <motion.div 
            key="generating"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-medium animate-pulse">Running Scheduling Engine...</p>
            <p className="text-sm text-[var(--text-muted)]">Applying Rule Engine • Optimizing Flow</p>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-8 bg-[var(--surface)] p-6 md:p-8 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-800"
          >
            {/* Core Settings */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-[var(--text-muted)]"><Clock size={16} /> Available Hours</label>
                <input type="number" step="0.5" {...register('availableHours')} className="w-full bg-[var(--background)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none text-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-[var(--text-muted)]"><Zap size={16} /> Energy Level</label>
                <select {...register('energyLevel')} className="w-full bg-[var(--background)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none text-xl capitalize">
                  <option value="high">High - Deep Work</option>
                  <option value="medium">Medium - Normal</option>
                  <option value="low">Low - Easy Mode</option>
                </select>
              </div>
            </div>

            {/* Fixed Events */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2 text-[var(--text-muted)]"><CalendarIcon size={16} /> Fixed Events</label>
                <button type="button" onClick={() => appendFixed({ title: '', time: '12:00', duration: 60 })} className="text-blue-500 text-sm font-medium hover:underline flex items-center gap-1"><Plus size={14} /> Add</button>
              </div>
              {fixedFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input {...register(`fixedEvents.${index}.title` as const)} placeholder="Event Name" className="flex-1 bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none" />
                  <input type="time" {...register(`fixedEvents.${index}.time` as const)} className="w-32 bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none" />
                  <input type="number" placeholder="Min" {...register(`fixedEvents.${index}.duration` as const)} className="w-24 bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none" />
                  <button type="button" onClick={() => removeFixed(index)} className="p-3 text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500/20"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>

            {/* Urgent Work */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2 text-[var(--text-muted)]"><CheckCircle2 size={16} /> Urgent Tasks (Other Work)</label>
                <button type="button" onClick={() => appendUrgent({ title: '', duration: 30 })} className="text-blue-500 text-sm font-medium hover:underline flex items-center gap-1"><Plus size={14} /> Add</button>
              </div>
              {urgentFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input {...register(`urgentTasks.${index}.title` as const)} placeholder="Task Name" className="flex-1 bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none" />
                  <input type="number" placeholder="Mins" {...register(`urgentTasks.${index}.duration` as const)} className="w-24 bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none" />
                  <button type="button" onClick={() => removeUrgent(index)} className="p-3 text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500/20"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>

            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25">
              Generate Today's Plan
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
