import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ensureDBReady, isIndexedDBAvailable, resetDB } from './db/db';

import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import DailyPlanner from './pages/DailyPlanner';
import CurrentTask from './pages/CurrentTask';
import Timeline from './pages/Timeline';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

/**
 * FIXES for "stuck on loading screen when opening on internet":
 * 1. Switched from BrowserRouter to HashRouter -> works on any static host (GitHub Pages, Netlify, Vercel) without server rewrite.
 * 2. Added IndexedDB availability check + ensureDBReady with timeout (5s). Previously useLiveQuery could stay undefined forever if IDB blocked.
 * 3. Added loading timeout fallback: after 4s, automatically forces Setup if still undefined.
 * 4. Added recovery UI with reset button to clear corrupted DB.
 * 5. Theme handling made safe against matchMedia missing.
 */

function AppContent() {
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [forceShowSetup, setForceShowSetup] = useState(false);

  // Attempt to open DB with timeout on mount
  useEffect(() => {
    if (!isIndexedDBAvailable()) {
      setDbError('IndexedDB is blocked. Please disable private/incognito mode and allow site storage. Safari: Settings > Safari > Clear History or disable private mode.');
      setDbReady(true);
      return;
    }

    let cancelled = false;
    ensureDBReady(6000)
      .then(() => {
        if (!cancelled) setDbReady(true);
      })
      .catch((e: any) => {
        console.error('DB ready failed', e);
        if (!cancelled) {
          setDbError(e?.message || 'Failed to open local database');
          setDbReady(true); // still allow rendering error/setup
        }
      });

    // Fallback: if DB still not ready after 8s, force move on
    const fallback = setTimeout(() => {
      if (!cancelled && !dbReady) {
        setForceShowSetup(true);
        setDbReady(true);
      }
    }, 8000);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, []);

  // Live query only after DB ready attempt
  const settings = useLiveQuery(() => (dbReady ? db.settings.get(1) : undefined), [dbReady]);

  // Theme handling - safe
  useEffect(() => {
    try {
      const theme = settings?.theme;
      if (theme) {
        const isDark =
          theme === 'dark' ||
          (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', !!isDark);
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch {
      document.documentElement.classList.add('dark');
    }
  }, [settings?.theme]);

  const handleReset = async () => {
    await resetDB();
    window.location.hash = '#/';
    window.location.reload();
  };

  // Initial booting state - waiting for DB
  if (!dbReady) {
    return <LoadingScreen onReset={handleReset} />;
  }

  // DB error UI
  if (dbError) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-[#0f1115] text-white p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h1 className="text-xl font-bold mb-2">Storage Blocked</h1>
          <p className="text-sm text-zinc-400 mb-4">{dbError}</p>
          <p className="text-xs text-zinc-500 mb-6">
            LifePlanner OS is 100% offline-first and needs IndexedDB.
            <br />
            <br />
            Quick fixes:
            <br />
            • Turn off private/incognito mode
            <br />
            • Settings {'>'} Privacy {'>'} Allow storage for this site
            <br />
            • On iPhone: Use normal Safari tab, not Private
            <br />• Clear site data and reload
          </p>
          <div className="space-y-2">
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-white text-black rounded-xl font-semibold">
              Reload
            </button>
            <button onClick={handleReset} className="w-full py-3 bg-zinc-800 text-white rounded-xl">
              Clear Storage & Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Still undefined after DB ready? Show loading with auto-force after delay
  if (settings === undefined && !forceShowSetup) {
    return <LoadingScreen onReset={handleReset} />;
  }

  // If no settings or setup not complete -> show setup flow
  if (!settings || !settings.isSetupComplete || forceShowSetup) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </HashRouter>
    );
  }

  // Normal authenticated app
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plan" element={<DailyPlanner />} />
          <Route path="/active" element={<CurrentTask />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default function App() {
  return <AppContent />;
}
