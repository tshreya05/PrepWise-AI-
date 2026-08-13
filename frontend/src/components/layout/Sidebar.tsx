import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Mic, FileText, BookOpen, Library, Map,
  Brain, History, BarChart3, User, LogOut, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/interview', label: 'Interview', icon: Mic, badge: 'Voice' },
  { path: '/resume-analysis', label: 'Resume', icon: FileText },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/resources', label: 'Resources', icon: Library },
  { path: '/roadmaps', label: 'Roadmaps', icon: Map, badge: 'New' },
  { path: '/practice', label: 'Practice', icon: Brain },
  { path: '/history', label: 'History', icon: History },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-slate-200/60 dark:border-white/10 flex flex-col z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/60 dark:border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              PrepWise <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">AI</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Voice Interview SaaS</p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon, badge }) => {
          const active = location.pathname.startsWith(path)
          return (
            <Link key={path} to={path} className="relative block">
              <div
                className={cn(
                  'relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 z-10',
                  active
                    ? 'text-indigo-600 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4', active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                      badge === 'Voice'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    )}
                  >
                    {badge}
                  </span>
                )}
              </div>

              {/* Animated active pill indicator */}
              {active && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-indigo-500/15 dark:bg-indigo-500/20 border border-indigo-500/30 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer User Info & Logout */}
      <div className="p-3 border-t border-slate-200/60 dark:border-white/10">
        <div className="px-3 py-2 mb-1 rounded-xl bg-slate-100/60 dark:bg-white/5">
          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
            {user?.full_name || 'Guest User'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {user?.email || 'user@prepwise.ai'}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
