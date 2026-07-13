import { useEffect, useState } from 'react';

export default function LoadingScreen({ onReset }: { onReset?: () => void }) {
  const [dots, setDots] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    const helpId = setTimeout(() => setShowHelp(true), 3500);
    return () => {
      clearInterval(id);
      clearTimeout(helpId);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0f1115] text-white p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight">LifePlanner OS{dots}</h2>
          <p className="text-sm text-zinc-400 mt-2">Booting your personal OS</p>
        </div>

        {showHelp && (
          <div className="mt-6 max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center animate-in fade-in">
            <p className="text-sm text-zinc-300 mb-1">Taking longer than usual?</p>
            <p className="text-xs text-zinc-500 mb-4">
              This happens if storage is blocked, you're in private mode, or service worker cache is stale.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 bg-white text-black rounded-xl font-medium text-sm"
              >
                Retry Reload
              </button>
              {onReset && (
                <button
                  onClick={onReset}
                  className="w-full py-2.5 bg-zinc-800 text-white rounded-xl font-medium text-sm"
                >
                  Clear Cache & Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-[10px] text-zinc-600 tracking-widest uppercase">
        Offline-first • No tracking
      </div>
    </div>
  );
}
