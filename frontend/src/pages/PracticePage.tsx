import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle2, XCircle, Loader2, Trophy, RotateCcw } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-emerald-500" />
            AI MCQ Quiz Practice
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate customized technical MCQs to reinforce weak areas.
          </p>
        </div>

        {/* Generator Controls Card */}
        <Card className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Topic Name"
              placeholder="e.g. System Design, React 18, SQL Indexes"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Difficulty</label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                      difficulty === d
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full justify-center" onClick={generateQuiz} disabled={loading || !topic.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Quiz'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Quiz Runner */}
        <AnimatePresence mode="wait">
          {finished ? (
            <motion.div key="finished" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quiz Completed!</h2>
                <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {score} / {questions.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {score === questions.length ? 'Outstanding score! You mastered this topic.' : 'Good effort! Review explanations to reinforce knowledge.'}
                </p>
                <Button onClick={generateQuiz} className="mx-auto">
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Try Another Quiz
                </Button>
              </Card>
            </motion.div>
          ) : questions.length > 0 ? (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="space-y-6">
                {/* Quiz Header & Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">Question {currentQ + 1} of {questions.length}</span>
                    <Badge variant="accent" size="sm" className="capitalize">{difficulty}</Badge>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {questions[currentQ].question}
                </h3>

                <div className="space-y-2.5">
                  {questions[currentQ].options.map((opt, i) => {
                    const isCorrect = i === questions[currentQ].correct_index
                    const isSelected = i === selected
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-xl border text-xs transition-all ${
                          showResult
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
                              : isSelected
                              ? 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold'
                              : 'border-slate-200/50 dark:border-white/5 opacity-40'
                            : 'border-slate-200/80 dark:border-white/10 glass hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                          <span>{opt}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {showResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-white/10">
                      <span className="font-bold text-indigo-500">Explanation: </span>
                      {questions[currentQ].explanation}
                    </div>
                    <Button onClick={nextQuestion} className="w-full justify-center">
                      {currentQ < questions.length - 1 ? 'Next Question' : 'View Final Score'}
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ) : !loading ? (
            <Card className="text-center py-12">
              <Brain className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Enter a topic above (e.g. System Design) and click Generate Quiz to begin.
              </p>
            </Card>
          ) : null}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
