import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History, Mic, ChevronRight, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { interviewApi } from '@/services/api'

interface HistoryItem {
  id: number
  interview_type: string
  status: string
  overall_score: number | null
  created_at: string
  completed_at: string | null
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    interviewApi.history()
      .then(({ data }) => setHistory(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-500" />
            Interview History & Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review past voice mock interview sessions, transcripts, and evaluation scorecards.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <Card className="text-center py-12">
            <History className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">No voice interview sessions recorded yet.</p>
            <Link to="/interview">
              <span className="text-xs font-semibold text-indigo-500 hover:underline">Start your first interview →</span>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={item.status === 'completed' ? `/report/${item.id}` : '/interview'}>
                  <Card hover className="flex items-center justify-between cursor-pointer p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                          {item.interview_type} Voice Mock Interview
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={item.status === 'completed' ? 'success' : 'warning'} size="sm">
                        {item.status}
                      </Badge>
                      {item.overall_score !== null && (
                        <span className="font-black text-base text-slate-900 dark:text-white">
                          {item.overall_score.toFixed(0)}%
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
