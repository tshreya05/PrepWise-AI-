import { useState } from 'react'
import {
  User, Mail, Briefcase, Mic, ShieldCheck, Award, Moon, Sun, Settings, Check, Volume2, Sparkles
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

const targetRoles = [
  'Senior Frontend Engineer',
  'Full Stack Architect',
  'Backend System Specialist',
  'AI / LLM Application Engineer',
  'DevOps & Infrastructure Engineer',
]

const skillOptions = [
  'React 18', 'TypeScript', 'FastAPI', 'Python', 'System Design',
  'FAISS Vector Store', 'RAG Pipelines', 'TailwindCSS', 'GraphQL', 'Docker',
]

export default function ProfilePage() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [selectedRole, setSelectedRole] = useState('Full Stack Architect')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'React 18', 'TypeScript', 'FastAPI', 'System Design', 'RAG Pipelines'
  ])
  const [testingMic, setTestingMic] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const testMicrophone = async () => {
    try {
      setTestingMic(true)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicLevel(85)
      setTimeout(() => {
        stream.getTracks().forEach(t => t.stop())
        setTestingMic(false)
        setMicLevel(0)
      }, 3000)
    } catch {
      alert('Microphone permission denied or device not found.')
      setTestingMic(false)
    }
  }

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-6 h-6 text-indigo-500" />
              Candidate Profile & System Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your target interview tracks, audio peripherals, and theme options.
            </p>
          </div>

          <Button onClick={handleSave} size="sm">
            {savedSuccess ? <Check className="w-4 h-4 mr-1 text-emerald-300" /> : null}
            {savedSuccess ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="flex flex-col sm:flex-row items-center gap-6 p-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </span>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.full_name || 'Candidate User'}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email || 'candidate@prepwise.ai'}
            </p>
            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <Badge variant="primary" size="sm">Pro Account</Badge>
              <Badge variant="success" size="sm">Voice Verified</Badge>
            </div>
          </div>
        </Card>

        {/* Target Role & Skills Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-500" /> Target Job Role
            </h3>
            <div className="space-y-2">
              {targetRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all ${
                    selectedRole === role
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" /> Competency Skill Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => {
                const active = selectedSkills.includes(skill)
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}{skill}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Hardware & Preferences Card */}
        <Card className="space-y-4">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" /> Audio & Appearance Preferences
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Microphone Test Tool */}
            <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-rose-500" /> Microphone Hardware Check
                </span>
                {testingMic && <span className="text-[10px] font-bold text-rose-500 animate-pulse">Testing...</span>}
              </div>

              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${micLevel}%` }}
                />
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={testMicrophone}
                disabled={testingMic}
              >
                <Volume2 className="w-3.5 h-3.5 mr-1" />
                {testingMic ? 'Speak into mic...' : 'Test Microphone Input'}
              </Button>
            </div>

            {/* Theme Control */}
            <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  Theme Mode
                </span>
                <Badge variant="primary" size="sm" className="capitalize">{theme} Mode</Badge>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={toggleTheme}
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </Button>
            </div>
          </div>
        </Card>

        {/* Certificates & Achievements Placeholder */}
        <Card className="space-y-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Achievements & Certification Badges
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <Award className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">System Design Ace</p>
              <p className="text-[10px] text-slate-400">Score &gt;85%</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
              <Mic className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">Fluent Speaker</p>
              <p className="text-[10px] text-slate-400">Low Filler Rate</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">RAG Master</p>
              <p className="text-[10px] text-slate-400">FAISS Index Ready</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center opacity-50">
              <Award className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">Interview Ready</p>
              <p className="text-[10px] text-slate-400">Locked</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
