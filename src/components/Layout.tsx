import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, PlayCircle, Clock, BarChart2, Settings } from 'lucide-react';
import clsx from 'clsx';

import HelpGuide from './HelpGuide';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/plan', icon: Calendar, label: 'Plan' },
  { path: '/active', icon: PlayCircle, label: 'Active' },
  { path: '/timeline', icon: Clock, label: 'Timeline' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-[var(--surface)] relative z-20">
        <div className="p-6 flex items-center gap-3">
          <img src="/logo.png" alt="LifePlanner OS" className="w-8 h-8 rounded-lg shadow-sm" />
          <h1 className="text-xl font-bold tracking-tight">LifePlanner</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive 
                    ? 'bg-blue-600 text-white font-medium shadow-md' 
                    : 'text-[var(--text-muted)] hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-[var(--text)]'
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative flex flex-col">
        {/* Top bar for Help/Profile items */}
        <div className="absolute top-6 right-6 z-20">
          <HelpGuide />
        </div>
        {children}
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-200 dark:border-zinc-800 bg-[var(--surface)]/80 backdrop-blur-md pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex flex-col items-center justify-center w-full py-2',
                  isActive ? 'text-blue-500' : 'text-[var(--text-muted)]'
                )}
              >
                <Icon size={24} className={isActive ? 'fill-blue-500/20' : ''} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  );
}
