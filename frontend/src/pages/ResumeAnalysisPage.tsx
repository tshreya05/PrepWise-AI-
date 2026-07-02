import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Link2, BarChart3, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
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
      setError(msg || 'Please upload a resume first')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { runAnalysis() }, [])

  const sections = analysis ? [
    { title: 'Missing Keywords', items: analysis.missing_keywords, icon: AlertTriangle, color: 'text-yellow-400' },
    { title: 'Weak Bullet Points', items: analysis.weak_bullet_points, icon: AlertTriangle, color: 'text-orange-400' },
    { title: 'Grammar Suggestions', items: analysis.grammar_suggestions, icon: CheckCircle, color: 'text-blue-400' },
    { title: 'Missing Measurable Impact', items: analysis.missing_measurable_impact, icon: BarChart3, color: 'text-red-400' },
    { title: 'Missing Links', items: analysis.missing_links, icon: Link2, color: 'text-purple-400' },
  ] : []

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Resume Analysis</h1>
            <p className="text-muted">AI-powered resume feedback against your job description</p>
          </div>
          <Button onClick={runAnalysis} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Re-analyze'}
          </Button>
        </div>

        {error && <div className="glass border-red-500/30 text-red-400 p-4 rounded-xl mb-6">{error}</div>}

        {loading && !analysis && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {analysis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="mb-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-primary flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-primary">{analysis.overall_score.toFixed(0)}</span>
              </div>
              <h3 className="font-semibold text-lg">Overall Resume Score</h3>
              <p className="text-muted mt-2 max-w-lg mx-auto">{analysis.summary}</p>
            </Card>

            <div className="space-y-4">
              {sections.map((section) => (
                <Card key={section.title}>
                  <div className="flex items-center gap-3 mb-4">
                    <section.icon className={`w-5 h-5 ${section.color}`} />
                    <h3 className="font-semibold">{section.title}</h3>
                    <span className="text-xs text-muted ml-auto">{section.items.length} items</span>
                  </div>
                  {section.items.length > 0 ? (
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-sm text-muted p-3 rounded-xl bg-white/5 flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-400">No issues found</p>
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
