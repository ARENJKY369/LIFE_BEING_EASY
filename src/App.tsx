import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';

import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import DailyPlanner from './pages/DailyPlanner';
import CurrentTask from './pages/CurrentTask';
import Timeline from './pages/Timeline';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  const settings = useLiveQuery(() => db.settings.get(1));

  useEffect(() => {
    if (settings?.theme) {
      const isDark = 
        settings.theme === 'dark' || 
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark'); // Default dark
    }
  }, [settings?.theme]);

  if (settings === undefined) return <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-white">Loading...</div>;

  if (!settings || !settings.isSetupComplete) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="*" element={<Navigate to="/setup" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plan" element={<DailyPlanner />} />
          <Route path="/active" element={<CurrentTask />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
