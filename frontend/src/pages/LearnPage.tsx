import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, ExternalLink, HelpCircle, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { learnApi } from '@/services/api'

interface LearningCard {
  id: number
  topic: string
  reason: string
  estimated_time: string
  resources: Array<{ title: string; url: string; type: string }>
  quiz: Array<{ question: string; options: string[]; correct: number }>
}

export default function LearnPage() {
  const [cards, setCards] = useState<LearningCard[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null)

  const fetchCards = async () => {
    setLoading(true)
    try {
      const { data } = await learnApi.getCards()
      setCards(data)
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCards() }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" />
              Personalized Learning Cards
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              AI recommendations based on your voice interview evaluations.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchCards} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh Recommendations'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Complete a voice mock interview session to generate personalized learning cards.
            </p>
          </Card>
        ) : (
          <div className="space-y-5">
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">{card.topic}</h3>
                        <Badge variant="primary" size="sm">Topic</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{card.reason}</p>
                    </div>
                    <Badge variant="accent" size="sm" className="flex-shrink-0">
                      <Clock className="w-3 h-3 mr-1" /> {card.estimated_time}
                    </Badge>
                  </div>

                  {card.resources && card.resources.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-white/10">
                      <h4 className="text-xs font-semibold text-slate-400 mb-2">Recommended External Resources</h4>
                      <div className="flex flex-wrap gap-2">
                        {card.resources.map((r, j) => (
                          <a
                            key={j}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5 font-medium"
                          >
                            {r.title} <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {card.quiz && card.quiz.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => setExpandedQuiz(expandedQuiz === card.id ? null : card.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-cyan-500 hover:underline"
                      >
                        <HelpCircle className="w-4 h-4" />
                        {expandedQuiz === card.id ? 'Hide Mini Quiz' : 'Take Mini Quiz'}
                      </button>

                      {expandedQuiz === card.id && (
                        <div className="mt-3 p-4 rounded-xl bg-slate-100 dark:bg-white/5 space-y-4">
                          {card.quiz.map((q, j) => (
                            <div key={j} className="space-y-2">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{q.question}</p>
                              <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, k) => (
                                  <div
                                    key={k}
                                    className={`text-xs p-2.5 rounded-xl border ${
                                      k === q.correct
                                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium'
                                        : 'bg-white/5 border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-slate-400'
                                    }`}
                                  >
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
