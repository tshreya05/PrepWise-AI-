import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Upload, FileText, Briefcase, Mic, Brain,
  CheckCircle2, Sparkles, Plus, Map,
  ChevronRight, Award, BarChart3
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { dashboardApi, resumeApi, jdApi } from '@/services/api'

interface DashboardData {
  has_resume: boolean
  has_job_description: boolean
  resume: { filename: string; skills: string[] } | null
  job_description: { preview: string } | null
  interview_history: Array<{
    id: number
    interview_type: string
    status: string
    overall_score: number | null
    created_at: string
  }>
  resume_analysis: Record<string, unknown> | null
  total_interviews: number
  average_score: number | null
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [uploading, setUploading] = useState('')
  const [jdModalOpen, setJdModalOpen] = useState(false)
  const [jdText, setJdText] = useState('')

  const resumeRef = useRef<HTMLInputElement>(null)
  const jdRef = useRef<HTMLInputElement>(null)

  const fetchDashboard = async () => {
    try {
      const { data: d } = await dashboardApi.get()
      setData(d)
    } catch {
      /* handled by api interceptor */
    } finally {
      /* fetch complete */
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('resume')
    try {
      await resumeApi.upload(file)
      await fetchDashboard()
    } catch {
      alert('Failed to upload resume. Please try a valid PDF or DOCX.')
    } finally {
      setUploading('')
    }
  }

  const handleJdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('jd')
    try {
      await jdApi.upload(file)
      await fetchDashboard()
    } catch {
      alert('Failed to upload JD. Please try a PDF file.')
    } finally {
      setUploading('')
    }
  }

  const handleJdPaste = async () => {
    if (!jdText.trim()) return
    setUploading('jd')
    try {
      await jdApi.paste(jdText)
      setJdText('')
      setJdModalOpen(false)
      await fetchDashboard()
    } catch {
      alert('Failed to save job description text.')
    } finally {
      setUploading('')
    }
  }

  const readinessScore = data?.average_score ? Math.round(data.average_score) : 75

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Workspace Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your personalized voice mock interview hub & preparation status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/interview">
              <Button size="md" className="shadow-lg shadow-indigo-500/25">
                <Mic className="w-4 h-4 mr-1.5" /> Start Voice Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Intelligence Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Readiness Score</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{readinessScore}%</p>
              <p className="text-[11px] text-emerald-500 font-medium mt-1">Based on performance</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Award className="w-6 h-6" />
            </div>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Mock Sessions</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{data?.total_interviews || 0}</p>
              <p className="text-[11px] text-slate-400 mt-1">Interviews completed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Mic className="w-6 h-6" />
            </div>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Streak</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">5 Days 🔥</p>
              <p className="text-[11px] text-amber-500 font-medium mt-1">Active practice streak</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">RAG Index</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {data?.has_resume && data?.has_job_description ? 'Ready' : 'Pending'}
              </p>
              <p className="text-[11px] text-indigo-400 mt-1">FAISS Vector Store</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* Resume & Job Description Context Status Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Resume Upload Card */}
          <Card className="flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Resume Status</h3>
              </div>
              <Badge variant={data?.has_resume ? 'success' : 'danger'} size="sm">
                {data?.has_resume ? 'Uploaded' : 'Action Required'}
              </Badge>
            </div>

            {data?.resume ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  File: <span className="text-slate-900 dark:text-white font-semibold">{data.resume.filename}</span>
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {data.resume.skills?.slice(0, 6).map((s) => (
                    <Badge key={s} variant="primary" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload your resume (PDF/DOCX) to allow RAG context extraction for personalized questions.
              </p>
            )}

            <input
              ref={resumeRef}
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={handleResumeUpload}
            />

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-center"
                onClick={() => resumeRef.current?.click()}
                disabled={uploading === 'resume'}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                {uploading === 'resume' ? 'Uploading...' : data?.has_resume ? 'Replace Resume' : 'Upload Resume'}
              </Button>

              {data?.has_resume && (
                <Link to="/resume-analysis">
                  <Button variant="primary" size="sm">
                    Analyze ATS
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          {/* Job Description Card */}
          <Card className="flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Target Job Description</h3>
              </div>
              <Badge variant={data?.has_job_description ? 'success' : 'neutral'} size="sm">
                {data?.has_job_description ? 'Indexed' : 'Optional'}
              </Badge>
            </div>

            {data?.job_description ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                "{data.job_description.preview}"
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload or paste a target job description to match questions against exact hiring requirements.
              </p>
            )}

            <input
              ref={jdRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleJdUpload}
            />

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => jdRef.current?.click()}
                disabled={uploading === 'jd'}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Upload PDF
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => setJdModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Paste Text
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Action Navigation Cards */}
        <div className="grid md:grid-cols-4 gap-5">
          <Link to="/interview">
            <Card hover className="h-full flex flex-col justify-between text-left">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-3">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Voice Interview Room</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Start technical & behavioral sessions</p>
              </div>
              <span className="text-xs font-semibold text-indigo-500 mt-4 inline-flex items-center gap-1">
                Launch <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>

          <Link to="/roadmaps">
            <Card hover className="h-full flex flex-col justify-between text-left">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Career Roadmaps</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Explore interactive skill tree paths</p>
              </div>
              <span className="text-xs font-semibold text-cyan-500 mt-4 inline-flex items-center gap-1">
                Explore <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>

          <Link to="/practice">
            <Card hover className="h-full flex flex-col justify-between text-left">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Practice Quizzes</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI-generated MCQs on weak topics</p>
              </div>
              <span className="text-xs font-semibold text-emerald-500 mt-4 inline-flex items-center gap-1">
                Practice <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>

          <Link to="/analytics">
            <Card hover className="h-full flex flex-col justify-between text-left">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Analytics Radar</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Speech & competency telemetry</p>
              </div>
              <span className="text-xs font-semibold text-amber-500 mt-4 inline-flex items-center gap-1">
                View Telemetry <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>
        </div>

        {/* Recent Interviews History Table */}
        {data?.interview_history && data.interview_history.length > 0 && (
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Voice Mock Sessions</h3>
              <Link to="/history" className="text-xs font-semibold text-indigo-500 hover:underline">
                View All History →
              </Link>
            </div>

            <div className="space-y-2">
              {data.interview_history.slice(0, 5).map((iv) => (
                <Link key={iv.id} to={iv.status === 'completed' ? `/report/${iv.id}` : '/interview'}>
                  <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-white capitalize">
                          {iv.interview_type} Voice Interview
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(iv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={iv.status === 'completed' ? 'success' : 'warning'} size="sm">
                        {iv.status}
                      </Badge>
                      {iv.overall_score !== null && (
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {iv.overall_score.toFixed(0)}%
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Paste Job Description Modal */}
      <Modal isOpen={jdModalOpen} onClose={() => setJdModalOpen(false)} title="Paste Job Description Text">
        <div className="space-y-4">
          <textarea
            className="input-field text-xs h-40 resize-none"
            placeholder="Paste target job requirements, responsibilities, or tech stack here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setJdModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleJdPaste} disabled={!jdText.trim() || uploading === 'jd'}>
              {uploading === 'jd' ? 'Saving...' : 'Save & Index JD'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
