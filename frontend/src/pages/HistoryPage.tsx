import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History, Mic, ChevronRight } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Interview History</h1>
        <p className="text-muted mb-8">Review your past mock interviews</p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <Card className="text-center py-12">
            <History className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted mb-4">No interviews yet</p>
            <Link to="/interview" className="text-primary hover:underline">Start your first interview</Link>
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
                  <Card hover className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Mic className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{item.interview_type} Interview</p>
                        <p className="text-sm text-muted">
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.status}
                      </span>
                      {item.overall_score !== null && (
                        <span className="font-bold text-lg">{item.overall_score.toFixed(0)}%</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted" />
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
