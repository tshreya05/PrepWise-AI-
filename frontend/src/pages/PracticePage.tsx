import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { practiceApi } from '@/services/api'

interface QuizQuestion {
  question: string
  options: string[]
  correct_index: number
  explanation: string
}

export default function PracticePage() {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const generateQuiz = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setQuestions([])
    setCurrentQ(0)
    setSelected(null)
    setShowResult(false)
    setScore(0)
    setFinished(false)
    try {
      const { data } = await practiceApi.generate({ topic, difficulty, num_questions: 5 })
      setQuestions(data.questions)
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (index: number) => {
    if (showResult) return
    setSelected(index)
    setShowResult(true)
    if (index === questions[currentQ].correct_index) {
      setScore((s) => s + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      setFinished(true)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Practice</h1>
        <p className="text-muted mb-8">Test your knowledge with AI-generated MCQs</p>

        <Card className="mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Topic"
              placeholder="e.g. System Design, React, SQL"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-sm text-muted font-medium">Difficulty</label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-xl text-sm capitalize transition-all ${
                      difficulty === d ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:bg-white/10'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={generateQuiz} disabled={loading || !topic.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Quiz'}
              </Button>
            </div>
          </div>
        </Card>

        <AnimatePresence mode="wait">
          {finished ? (
            <motion.div key="finished" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="text-center py-12">
                <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-3xl font-bold text-primary mb-4">
                  {score}/{questions.length}
                </p>
                <p className="text-muted mb-6">
                  {score === questions.length ? 'Perfect score!' :
                   score >= questions.length * 0.7 ? 'Great job!' : 'Keep practicing!'}
                </p>
                <Button onClick={generateQuiz}>Try Again</Button>
              </Card>
            </motion.div>
          ) : questions.length > 0 ? (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-muted">Question {currentQ + 1} of {questions.length}</span>
                  <span className="text-sm text-accent capitalize">{difficulty}</span>
                </div>

                <h3 className="text-lg font-medium mb-6">{questions[currentQ].question}</h3>

                <div className="space-y-3">
                  {questions[currentQ].options.map((opt, i) => {
                    const isCorrect = i === questions[currentQ].correct_index
                    const isSelected = i === selected
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          showResult
                            ? isCorrect
                              ? 'border-green-500/50 bg-green-500/10'
                              : isSelected
                              ? 'border-red-500/50 bg-red-500/10'
                              : 'border-white/10 opacity-50'
                            : 'border-white/10 hover:border-primary/50 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                          <span className="text-sm">{opt}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {showResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                    <p className="text-sm text-muted mb-4 p-3 rounded-xl bg-white/5">
                      {questions[currentQ].explanation}
                    </p>
                    <Button onClick={nextQuestion} className="w-full">
                      {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ) : !loading ? (
            <Card className="text-center py-12">
              <Brain className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted">Enter a topic and generate a practice quiz</p>
            </Card>
          ) : null}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
