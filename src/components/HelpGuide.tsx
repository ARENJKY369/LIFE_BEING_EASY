import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, CheckCircle2, Play, Calendar } from 'lucide-react';

export default function HelpGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      >
        <HelpCircle size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--surface)] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-[var(--surface)] sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-bold">How to use LifePlanner OS</h2>
                  <p className="text-[var(--text-muted)] text-sm mt-1">Master your personal operating system.</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8 flex-1">
                {/* Step 1 */}
                <section className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 w-10 h-10 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">1. The Morning Boot</h3>
                    <p className="text-[var(--text-muted)] leading-relaxed">
                      Every morning, navigate to the <strong>Plan</strong> tab. Tell the OS how many hours you have available, your energy level, and any urgent fixed events for today. Click "Generate". The engine will perfectly balance your rules and goals into a schedule.
                    </p>
                  </div>
                </section>

                {/* Step 2 */}
                <section className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                    <Play size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">2. Enter Focus Mode</h3>
                    <p className="text-[var(--text-muted)] leading-relaxed">
                      Go to the <strong>Active</strong> tab. This is your command center. You will only see <em>one task</em> at a time. Start the timer, do the work, and hit Complete. The OS automatically handles tracking and moving to the next objective.
                    </p>
                  </div>
                </section>

                {/* Step 3 */}
                <section className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 w-10 h-10 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">3. Zero Decision Fatigue</h3>
                    <p className="text-[var(--text-muted)] leading-relaxed">
                      Never ask "what should I do next?". The dashboard recalculates your "Free Time" dynamically based on your speed. Stick to the sequence, and watch your progress bar fill up until you earn your evening rest.
                    </p>
                  </div>
                </section>

                <div className="p-4 bg-[var(--background)] rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm">
                  <strong className="block mb-1">Pro Tip: PWA Installation</strong>
                  Install this app on your phone (Add to Home Screen in Safari/Chrome) or Desktop (Install Icon in address bar) to use it offline like a native app.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
