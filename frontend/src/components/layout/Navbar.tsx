import { useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, Bell, Search, User, LogOut, ChevronDown, Sparkles, Command
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import Modal from '@/components/ui/Modal'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Workspace',
  '/interview': 'AI Voice Interview Room',
  '/resume-analysis': 'Resume Intelligence',
  '/learn': 'Personalized Learning Paths',
  '/resources': 'Developer Resources',
  '/roadmaps': 'Interactive Career Roadmaps',
  '/practice': 'Quiz & MCQ Practice',
  '/history': 'Interview History & Reports',
  '/analytics': 'Performance Analytics',
  '/profile': 'User Profile & Settings',
}

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const activeTitle = routeTitles[location.pathname] || 'PrepWise AI'

  const searchItems = [
    { title: 'Start Voice Interview', path: '/interview', desc: 'Mock interview session' },
    { title: 'Resume Analysis', path: '/resume-analysis', desc: 'ATS score & improvements' },
    { title: 'Learning Cards', path: '/learn', desc: 'Personalized topics' },
    { title: 'Career Roadmaps', path: '/roadmaps', desc: 'Skill trees & node paths' },
    { title: 'Practice Quizzes', path: '/practice', desc: 'MCQs on weak topics' },
    { title: 'Performance Analytics', path: '/analytics', desc: 'Radar charts & score trends' },
    { title: 'Profile Settings', path: '/profile', desc: 'Target role & audio setup' },
  ]

  const filteredSearch = searchQuery
    ? searchItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchItems

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/60 dark:border-white/10 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {/* Section Breadcrumb & Title */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
              PrepWise
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {activeTitle}
            </h1>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-3">
            {/* Global Search Bar Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-200/60 dark:hover:bg-white/10"
            >
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Search app...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-200 dark:bg-white/10 rounded">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:bg-slate-200/60 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Bell */}
            <button
              className="relative p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:bg-slate-200/60 dark:hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </button>

            {/* User Profile Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 glass rounded-2xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 shadow-2xl p-2 z-20"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 mb-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {user?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user?.email || 'user@prepwise.ai'}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>Profile & Preferences</span>
                      </Link>

                      <Link
                        to="/analytics"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-cyan-500" />
                        <span>Analytics Dashboard</span>
                      </Link>

                      <button
                        onClick={() => {
                          setProfileOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-1 border-t border-slate-100 dark:border-white/10 pt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <Modal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} maxWidth="md">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
            <Search className="w-5 h-5 text-indigo-500" />
            <input
              type="text"
              autoFocus
              placeholder="Search features, roadmaps, interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filteredSearch.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  setSearchModalOpen(false)
                  setSearchQuery('')
                  navigate(item.path)
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-500/10 text-left transition-colors group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
                <span className="text-xs font-medium text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Jump →
                </span>
              </button>
            ))}
            {filteredSearch.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">No matching features found</p>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
