import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { db } from '../db/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface SetupForm {
  wakeUpTime: string;
  sleepTime: string;
  learningGoals: { name: string }[];
  fitnessGoal: string;
  weeklyRestDay: string;
  studySessionLength: number;
  breakLength: number;
}

const defaultGoals = [
  { name: 'JavaScript' },
  { name: 'Java' },
  { name: 'C++' },
  { name: 'Advanced Python' },
  { name: 'DSA' },
  { name: 'Bug Bounty' }
];

export default function Setup() {
  const [step, setStep] = useState(1);
  const { register, control, handleSubmit } = useForm<SetupForm>({
    defaultValues: {
      wakeUpTime: '07:00',
      sleepTime: '23:00',
      learningGoals: defaultGoals,
      fitnessGoal: '30 min cardio',
      weeklyRestDay: '0', // Sunday
      studySessionLength: 50,
      breakLength: 10
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'learningGoals'
  });

  const onSubmit = async (data: SetupForm) => {
    try {
      await db.settings.put({
        id: 1,
        wakeUpTime: data.wakeUpTime,
        sleepTime: data.sleepTime,
        learningGoals: data.learningGoals.map(g => g.name).filter(Boolean),
        fitnessGoal: data.fitnessGoal,
        weeklyRestDay: parseInt(data.weeklyRestDay),
        studySessionLength: data.studySessionLength,
        breakLength: data.breakLength,
        isSetupComplete: true,
        theme: 'system'
      });
      window.location.reload(); // To trigger App.tsx re-render
    } catch (e) {
      console.error(e);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[var(--surface)] p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">LifePlanner OS</h1>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 w-8 rounded-full transition-colors ${step >= i ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold">Time Configuration</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--text-muted)]">Wake-up Time</label>
                    <input type="time" {...register('wakeUpTime')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--text-muted)]">Sleep Time</label>
                    <input type="time" {...register('sleepTime')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none" />
                  </div>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--text-muted)]">Study Session (min)</label>
                    <input type="number" {...register('studySessionLength')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--text-muted)]">Break Length (min)</label>
                    <input type="number" {...register('breakLength')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <button type="button" onClick={nextStep} className="w-full py-4 bg-[var(--text)] text-[var(--background)] rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  Next <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold">Learning Goals</h2>
                <p className="text-sm text-[var(--text-muted)]">What are you mastering right now?</p>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`learningGoals.${index}.name` as const)}
                        className="flex-1 bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none"
                        placeholder="e.g. React Native"
                      />
                      <button type="button" onClick={() => remove(index)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => append({ name: '' })} className="w-full py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                  <Plus size={18} /> Add Goal
                </button>

                <div className="flex gap-4">
                  <button type="button" onClick={prevStep} className="flex-1 py-4 bg-[var(--background)] rounded-xl font-medium border border-zinc-200 dark:border-zinc-800">Back</button>
                  <button type="button" onClick={nextStep} className="flex-1 py-4 bg-[var(--text)] text-[var(--background)] rounded-xl font-medium flex items-center justify-center gap-2">Next <ArrowRight size={18} /></button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold">Fitness & Final Touches</h2>
                
                <div className="space-y-2">
                  <label className="text-sm text-[var(--text-muted)]">Fitness Goal</label>
                  <input {...register('fitnessGoal')} className="w-full bg-[var(--background)] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none" placeholder="e.g. 1 hour gym" />
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm leading-relaxed mb-6 font-mono">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.2 }}
                  >
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-500 mb-1">&gt; Initializing OS Core...</motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--text-muted)] mb-1">&gt; Loading Schedule Engine...</motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--text-muted)] mb-1">&gt; Injecting Rule Context...</motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-500 mt-2 font-bold">&gt; System Ready. Welcome.</motion.p>
                  </motion.div>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={prevStep} className="flex-1 py-4 bg-[var(--background)] rounded-xl font-medium border border-zinc-200 dark:border-zinc-800">Back</button>
                  <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">Start OS</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}
