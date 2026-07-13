import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Save } from 'lucide-react';

export default function Settings() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const [saved, setSaved] = useState(false);

  const { register, control, handleSubmit, reset } = useForm();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'learningGoals'
  });

  // Init form
  useEffect(() => {
    if (settings) {
      reset({
        ...settings,
        learningGoals: settings.learningGoals.map(g => ({ name: g }))
      });
    }
  }, [settings, reset]);

  if (!settings) return null;

  const onSubmit = async (data: any) => {
    await db.settings.update(1, {
      ...data,
      learningGoals: data.learningGoals.map((g: any) => g.name).filter(Boolean),
      weeklyRestDay: parseInt(data.weeklyRestDay)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-[var(--text-muted)]">Manage your OS preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-[var(--surface)] p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Preferences</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-muted)]">Theme</label>
              <select {...register('theme')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none">
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-muted)]">Weekly Rest Day</label>
              <select {...register('weeklyRestDay')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none">
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Times & Durations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-muted)]">Wake-up Time</label>
              <input type="time" {...register('wakeUpTime')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-muted)]">Sleep Time</label>
              <input type="time" {...register('sleepTime')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-muted)]">Study Session (min)</label>
              <input type="number" {...register('studySessionLength')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-muted)]">Break Length (min)</label>
              <input type="number" {...register('breakLength')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Goals</h2>
          <div className="space-y-2">
            <label className="text-sm text-[var(--text-muted)]">Fitness Goal</label>
            <input {...register('fitnessGoal')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--text-muted)]">Learning Goals</label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`learningGoals.${index}.name` as const)}
                  className="flex-1 bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none"
                />
                <button type="button" onClick={() => remove(index)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => append({ name: '' })} className="w-full py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mt-2">
              <Plus size={18} /> Add Goal
            </button>
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25">
          <Save size={20} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
