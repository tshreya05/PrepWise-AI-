import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Trophy, ThumbsUp, ThumbsDown, BookOpen, ArrowLeft, Loader2
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
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
      .catch(() => setError('Interview report not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (error || !report) {
    return (
      <AppLayout>
        <Card className="text-center py-12">
          <p className="text-rose-500 text-sm mb-4">{error || 'Report not found'}</p>
          <Link to="/history">
            <Button variant="secondary" size="sm">Back to History</Button>
          </Link>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/history" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Interview History
        </Link>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Top Banner */}
          <Card className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
            <div>
              <Badge variant="primary" size="sm" className="capitalize mb-2">{report.interview_type} Track</Badge>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                Voice Interview Scorecard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Conducted on {new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="w-24 h-24 rounded-full border-4 border-indigo-500 flex flex-col items-center justify-center bg-indigo-500/10 shadow-xl flex-shrink-0">
              <Trophy className="w-5 h-5 text-indigo-500 mb-0.5" />
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{report.overall_score.toFixed(0)}%</span>
              <span className="text-[9px] uppercase font-bold text-slate-400">Overall</span>
            </div>
          </Card>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-white/10">
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Identified Strengths</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-white/10">
                <ThumbsDown className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Areas to Improve</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">-</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Topics to Improve & Learning Recommendations */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-white/10">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recommended Skill Upgrades</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.topics_to_improve.map((t, i) => (
                <Badge key={i} variant="accent" size="sm">{t}</Badge>
              ))}
            </div>
            <div className="space-y-1.5 pt-2">
              {report.learning_recommendations.map((r, i) => (
                <p key={i} className="text-xs text-slate-500 dark:text-slate-400">• {r}</p>
              ))}
            </div>
          </Card>

          {/* Question Breakdown */}
          <Card className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Question-by-Question Breakdown</h3>
            <div className="space-y-4">
              {report.questions_detail.map((q, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 space-y-3">
                  <p className="font-bold text-xs text-slate-900 dark:text-white">Q{i + 1}: {q.question}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">Your answer: "{q.answer || 'No speech recorded'}"</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {Object.entries(q.scores || {}).map(([key, val]) => (
                      val !== null && (
                        <div key={key} className="p-2 rounded-lg bg-white/5">
                          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{val?.toFixed(0)}</p>
                          <p className="text-[9px] uppercase font-semibold text-slate-400">{key.replace('_', ' ')}</p>
                        </div>
                      )
                    ))}
                  </div>
                  {q.feedback && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{q.feedback}</p>}
                </div>
              ))}
            </div>
          </Card>

          {/* Action Footer */}
          <div className="flex gap-4">
            <Link to="/learn" className="flex-1">
              <Button className="w-full justify-center">View Learning Cards</Button>
            </Link>
            <Link to="/interview" className="flex-1">
              <Button variant="secondary" className="w-full justify-center">New Voice Session</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
