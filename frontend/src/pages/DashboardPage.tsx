import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload, FileText, Briefcase, Mic, BookOpen, Brain,
  CheckCircle, XCircle, TrendingUp,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
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
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState('')
  const resumeRef = useRef<HTMLInputElement>(null)
  const jdRef = useRef<HTMLInputElement>(null)
  const [jdText, setJdText] = useState('')

  const fetchDashboard = async () => {
    try {
      const { data: d } = await dashboardApi.get()
      setData(d)
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('resume')
    try {
      await resumeApi.upload(file)
      await fetchDashboard()
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
      await fetchDashboard()
    } finally {
      setUploading('')
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted mb-8">Manage your interview preparation</p>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Resume</h3>
              {data?.has_resume ? <CheckCircle className="w-4 h-4 text-green-400 ml-auto" /> : <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
            </div>
            {data?.resume ? (
              <div>
                <p className="text-sm text-muted mb-2">{data.resume.filename}</p>
                <div className="flex flex-wrap gap-1">
                  {data.resume.skills?.slice(0, 5).map((s) => (
                    <span key={s} className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">{s}</span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted mb-4">Upload your resume (PDF/DOCX)</p>
            )}
            <input ref={resumeRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleResumeUpload} />
            <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => resumeRef.current?.click()} disabled={uploading === 'resume'}>
              <Upload className="w-4 h-4 mr-2 inline" />
              {uploading === 'resume' ? 'Uploading...' : data?.has_resume ? 'Replace Resume' : 'Upload Resume'}
            </Button>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Job Description</h3>
              {data?.has_job_description ? <CheckCircle className="w-4 h-4 text-green-400 ml-auto" /> : <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
            </div>
            {data?.job_description ? (
              <p className="text-sm text-muted line-clamp-3">{data.job_description.preview}</p>
            ) : (
              <div className="space-y-3">
                <textarea
                  className="input-field text-sm h-20 resize-none"
                  placeholder="Paste job description text..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
                <Button variant="secondary" size="sm" className="w-full" onClick={handleJdPaste} disabled={!jdText.trim() || uploading === 'jd'}>
                  Save JD Text
                </Button>
              </div>
            )}
            <input ref={jdRef} type="file" accept=".pdf" className="hidden" onChange={handleJdUpload} />
            <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => jdRef.current?.click()} disabled={uploading === 'jd'}>
              <Upload className="w-4 h-4 mr-2 inline" />
              {uploading === 'jd' ? 'Uploading...' : 'Upload JD (PDF)'}
            </Button>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted text-sm">Total Interviews</span>
                <span className="font-semibold">{data?.total_interviews || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted text-sm">Average Score</span>
                <span className="font-semibold">{data?.average_score ? `${data.average_score}%` : 'N/A'}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/interview">
            <Card hover className="text-center cursor-pointer h-full">
              <Mic className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Start Interview</h3>
              <p className="text-sm text-muted mt-1">Begin a voice mock interview</p>
            </Card>
          </Link>
          <Link to="/learn">
            <Card hover className="text-center cursor-pointer h-full">
              <BookOpen className="w-10 h-10 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Learn</h3>
              <p className="text-sm text-muted mt-1">Personalized learning cards</p>
            </Card>
          </Link>
          <Link to="/practice">
            <Card hover className="text-center cursor-pointer h-full">
              <Brain className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Practice</h3>
              <p className="text-sm text-muted mt-1">MCQ quizzes on weak topics</p>
            </Card>
          </Link>
        </div>

        {data?.interview_history && data.interview_history.length > 0 && (
          <Card>
            <h3 className="font-semibold text-lg mb-4">Recent Interviews</h3>
            <div className="space-y-3">
              {data.interview_history.slice(0, 5).map((iv) => (
                <Link key={iv.id} to={iv.status === 'completed' ? `/report/${iv.id}` : '/interview'}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
                    <div>
                      <p className="font-medium capitalize">{iv.interview_type} Interview</p>
                      <p className="text-xs text-muted">{new Date(iv.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${iv.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {iv.status}
                      </span>
                      {iv.overall_score && <p className="text-sm font-semibold mt-1">{iv.overall_score.toFixed(0)}%</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </motion.div>
    </AppLayout>
  )
}
