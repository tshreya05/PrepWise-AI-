import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Link2, BarChart3, Loader2, FileText } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { resumeApi } from '@/services/api'

interface Analysis {
  missing_keywords: string[]
  weak_bullet_points: string[]
  grammar_suggestions: string[]
  missing_measurable_impact: string[]
  missing_links: string[]
  overall_score: number
  summary: string
}

export default function ResumeAnalysisPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runAnalysis = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await resumeApi.analyze()
      setAnalysis(data)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Please upload a resume first to run ATS intelligence analysis.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { runAnalysis() }, [])

  const sections = analysis ? [
    { title: 'Missing ATS Keywords', items: analysis.missing_keywords, icon: AlertTriangle, color: 'text-amber-500', badge: 'Critical' },
    { title: 'Weak Bullet Points', items: analysis.weak_bullet_points, icon: AlertTriangle, color: 'text-orange-500', badge: 'Action Needed' },
    { title: 'Grammar Suggestions', items: analysis.grammar_suggestions, icon: CheckCircle2, color: 'text-indigo-400', badge: 'Style' },
    { title: 'Missing Measurable Impact', items: analysis.missing_measurable_impact, icon: BarChart3, color: 'text-rose-500', badge: 'Metrics' },
    { title: 'Missing Links (Portfolio/GitHub)', items: analysis.missing_links, icon: Link2, color: 'text-purple-400', badge: 'Social' },
  ] : []

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-500" />
              Resume Intelligence & ATS Analyzer
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              AI feedback matching your resume against the target job description.
            </p>
          </div>

          <Button onClick={runAnalysis} disabled={loading} size="sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Re-analyze Resume'}
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl glass border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        {loading && !analysis && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {analysis && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Score Overview Card */}
            <Card className="text-center py-8 space-y-3">
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-indigo-500 flex items-center justify-center bg-indigo-500/10 shadow-xl">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {analysis.overall_score.toFixed(0)}
                </span>
              </div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Overall ATS Alignment Score</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                {analysis.summary}
              </p>
            </Card>

            {/* Diagnostic Sections */}
            <div className="space-y-4">
              {sections.map((section) => (
                <Card key={section.title} className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10">
                    <div className="flex items-center gap-2.5">
                      <section.icon className={`w-4 h-4 ${section.color}`} />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{section.title}</h3>
                    </div>
                    <Badge variant="neutral" size="sm">{section.items.length} items</Badge>
                  </div>

                  {section.items.length > 0 ? (
                    <ul className="space-y-2 text-xs">
                      {section.items.map((item, i) => (
                        <li key={i} className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-500 font-semibold">No issues found in this category.</p>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}
