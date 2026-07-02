import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Trophy, ThumbsUp, ThumbsDown, BookOpen, MessageSquare, ArrowLeft, Loader2,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { interviewApi } from '@/services/api'

interface Report {
  id: number
  interview_type: string
  overall_score: number
  strengths: string[]
  weaknesses: string[]
  topics_to_improve: string[]
  learning_recommendations: string[]
  transcript: Array<{ role: string; text: string }>
  questions_detail: Array<{
    question: string
    answer: string
    scores: Record<string, number>
    feedback: string
    ideal_answer: string
  }>
  created_at: string
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    interviewApi.report(Number(id))
      .then(({ data }) => setReport(data))
      .catch(() => setError('Report not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (error || !report) {
    return (
      <AppLayout>
        <Card className="text-center py-12">
          <p className="text-red-400 mb-4">{error || 'Report not found'}</p>
          <Link to="/history"><Button variant="secondary">Back to History</Button></Link>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Link to="/history" className="inline-flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold capitalize">{report.interview_type} Interview Report</h1>
              <p className="text-muted mt-1">
                {new Date(report.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center">
              <div className="text-center">
                <Trophy className="w-5 h-5 text-primary mx-auto" />
                <span className="text-xl font-bold">{report.overall_score.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <ThumbsUp className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted flex items-start gap-2">
                    <span className="text-green-400">+</span> {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <ThumbsDown className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold">Weaknesses</h3>
              </div>
              <ul className="space-y-2">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-muted flex items-start gap-2">
                    <span className="text-red-400">-</span> {w}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Topics to Improve</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {report.topics_to_improve.map((t, i) => (
                <span key={i} className="text-sm px-3 py-1 rounded-full bg-accent/20 text-accent">{t}</span>
              ))}
            </div>
            <h4 className="text-sm font-medium text-muted mb-2">Learning Recommendations</h4>
            <ul className="space-y-1">
              {report.learning_recommendations.map((r, i) => (
                <li key={i} className="text-sm text-muted">• {r}</li>
              ))}
            </ul>
          </Card>

          <Card className="mb-6">
            <h3 className="font-semibold mb-4">Question-by-Question Breakdown</h3>
            <div className="space-y-6">
              {report.questions_detail.map((q, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5">
                  <p className="font-medium text-sm mb-2">Q{i + 1}: {q.question}</p>
                  <p className="text-sm text-muted mb-3">Your answer: {q.answer || 'No answer'}</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {Object.entries(q.scores).map(([key, val]) => (
                      val !== null && (
                        <div key={key} className="text-center p-2 rounded-lg bg-white/5">
                          <p className="text-sm font-bold text-primary">{val?.toFixed(0)}</p>
                          <p className="text-xs text-muted capitalize">{key.replace('_', ' ')}</p>
                        </div>
                      )
                    ))}
                  </div>
                  <p className="text-xs text-muted">{q.feedback}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Interview Transcript</h3>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {report.transcript.map((entry, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-sm ${
                    entry.role === 'interviewer'
                      ? 'bg-primary/10 border-l-2 border-primary'
                      : 'bg-accent/10 border-l-2 border-accent ml-4'
                  }`}
                >
                  <span className="text-xs font-medium uppercase text-muted">
                    {entry.role === 'interviewer' ? 'AI' : 'You'}
                  </span>
                  <p className="mt-1">{entry.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-4 mt-6">
            <Link to="/learn"><Button className="flex-1">View Learning Cards</Button></Link>
            <Link to="/interview"><Button variant="secondary" className="flex-1">New Interview</Button></Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
