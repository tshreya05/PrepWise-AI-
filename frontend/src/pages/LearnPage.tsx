import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, ExternalLink, HelpCircle, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Learn</h1>
            <p className="text-muted">Personalized learning paths based on your interview performance</p>
          </div>
          <Button variant="secondary" onClick={fetchCards} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">Complete an interview to get personalized learning cards</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{card.topic}</h3>
                      <p className="text-sm text-muted mt-1">{card.reason}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-accent">
                      <Clock className="w-4 h-4" />
                      {card.estimated_time}
                    </div>
                  </div>

                  {card.resources.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted mb-2">Suggested Resources</h4>
                      <div className="flex flex-wrap gap-2">
                        {card.resources.map((r, j) => (
                          <a
                            key={j}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-all flex items-center gap-1"
                          >
                            {r.title} <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {card.quiz.length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedQuiz(expandedQuiz === card.id ? null : card.id)}
                        className="flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <HelpCircle className="w-4 h-4" />
                        {expandedQuiz === card.id ? 'Hide' : 'Show'} Mini Quiz
                      </button>
                      {expandedQuiz === card.id && (
                        <div className="mt-3 p-4 rounded-xl bg-white/5 space-y-3">
                          {card.quiz.map((q, j) => (
                            <div key={j}>
                              <p className="text-sm font-medium mb-2">{q.question}</p>
                              <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, k) => (
                                  <div
                                    key={k}
                                    className={`text-xs p-2 rounded-lg ${
                                      k === q.correct ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-muted'
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
