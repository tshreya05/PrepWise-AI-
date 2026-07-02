import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Mic, FileText, BookOpen, Brain,
  History, LogOut, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/interview', label: 'Interview', icon: Mic },
  { path: '/resume-analysis', label: 'Resume', icon: FileText },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/practice', label: 'Practice', icon: Brain },
  { path: '/history', label: 'History', icon: History },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/10 flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">PrepWise AI</h1>
            <p className="text-xs text-muted">Voice Interviews</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname.startsWith(path)
          return (
            <Link key={path} to={path}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  active ? 'bg-primary/20 text-white' : 'text-muted hover:text-white hover:bg-white/5'
                )}
                whileHover={{ x: 4 }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="px-4 py-2 mb-2">
          <p className="text-sm font-medium truncate">{user?.full_name}</p>
          <p className="text-xs text-muted truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
