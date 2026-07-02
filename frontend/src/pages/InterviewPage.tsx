import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Play, Square, Volume2, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Waveform from '@/components/interview/Waveform'
import Timer from '@/components/interview/Timer'
import { interviewApi } from '@/services/api'

type InterviewPhase = 'setup' | 'listening' | 'recording' | 'processing' | 'feedback' | 'complete'

const INTERVIEW_TYPES = [
  { id: 'technical', label: 'Technical', desc: 'Coding, system design, and technical concepts' },
  { id: 'behavioral', label: 'Behavioral', desc: 'STAR method, teamwork, and soft skills' },
  { id: 'projects', label: 'Projects', desc: 'Deep dive into your project experience' },
  { id: 'hr', label: 'HR', desc: 'Culture fit, motivation, and career goals' },
]

interface TranscriptEntry {
  role: 'interviewer' | 'candidate'
  text: string
}

interface Evaluation {
  technical_accuracy: number
  communication: number
  confidence: number
  completeness: number
}

export default function InterviewPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<InterviewPhase>('setup')
  const [interviewType, setInterviewType] = useState('technical')
  const [interviewId, setInterviewId] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(5)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [feedback, setFeedback] = useState('')
  const [idealAnswer, setIdealAnswer] = useState('')
  const [scores, setScores] = useState<Evaluation | null>(null)
  const [error, setError] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playAudio = useCallback((base64: string, format: string = 'mp3') => {
    return new Promise<void>((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(`data:audio/${format};base64,${base64}`)
      audioRef.current = audio
      setIsSpeaking(true)
      audio.onended = () => {
        setIsSpeaking(false)
        resolve()
      }
      audio.onerror = () => {
        setIsSpeaking(false)
        resolve()
      }
      audio.play().catch(() => {
        setIsSpeaking(false)
        resolve()
      })
    })
  }, [])

  const startInterview = async () => {
    setError('')
    setPhase('processing')
    try {
      const { data } = await interviewApi.start(interviewType)
      setInterviewId(data.interview_id)
      setCurrentQuestion(data.question)
      setQuestionIndex(data.question_index)
      setTotalQuestions(data.total_questions)
      setTranscript([{ role: 'interviewer', text: data.question }])
      setPhase('listening')
      if (data.audio_base64) {
        await playAudio(data.audio_base64, data.audio_format)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Failed to start interview. Please upload a resume first.')
      setPhase('setup')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setPhase('recording')
    } catch {
      setError('Microphone access denied. Please allow microphone permissions.')
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !interviewId) return

    setPhase('processing')
    setIsRecording(false)

    const recorder = mediaRecorderRef.current
    const audioBlob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        resolve(blob)
      }
      recorder.stop()
      recorder.stream.getTracks().forEach((t) => t.stop())
    })

    try {
      const { data } = await interviewApi.answer(interviewId, audioBlob)
      setScores(data.evaluation)
      setFeedback(data.feedback)
      setIdealAnswer(data.ideal_answer)

      if (data.transcribed_answer) {
        setTranscript((prev) => [
          ...prev,
          { role: 'candidate', text: data.transcribed_answer },
        ])
      }

      if (data.is_complete) {
        setPhase('complete')
        setTimeout(() => navigate(`/report/${interviewId}`), 3000)
      } else {
        setPhase('feedback')
        setTimeout(async () => {
          if (data.next_question) {
            setCurrentQuestion(data.next_question)
            setQuestionIndex(data.question_index ?? questionIndex + 1)
            setTranscript((prev) => [
              ...prev,
              { role: 'interviewer', text: data.next_question! },
            ])
            setPhase('listening')
            if (data.next_audio_base64) {
              await playAudio(data.next_audio_base64)
            }
          }
        }, 4000)
      }
    } catch {
      setError('Failed to process your answer. Please try again.')
      setPhase('listening')
    }
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause()
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Voice Interview</h1>
        <p className="text-muted mb-8">Speak your answers — this is a voice-only interview</p>

        {error && (
          <div className="glass border-red-500/30 text-red-400 p-4 rounded-xl mb-6">{error}</div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="mb-6">
                <h3 className="font-semibold text-lg mb-4">Select Interview Type</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {INTERVIEW_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setInterviewType(t.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        interviewType === t.id
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <p className="font-medium">{t.label}</p>
                      <p className="text-sm text-muted mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>
              <Button size="lg" className="w-full" onClick={startInterview}>
                <Mic className="w-5 h-5 mr-2 inline" /> Start Voice Interview
              </Button>
            </motion.div>
          )}

          {phase !== 'setup' && (
            <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="mb-6 text-center relative overflow-hidden">
                <div className="absolute top-4 right-4 flex items-center gap-4">
                  <Timer isRunning={phase === 'recording' || phase === 'listening'} />
                  <span className="text-sm text-muted">
                    Q{questionIndex + 1}/{totalQuestions}
                  </span>
                </div>

                <div className="py-8">
                  <Waveform isActive={isSpeaking || isRecording} className="mb-6" />

                  <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center relative">
                    <div className={`absolute inset-0 rounded-full ${
                      isRecording ? 'bg-red-500/20 animate-pulse' :
                      isSpeaking ? 'bg-primary/20 animate-pulse-slow' :
                      'bg-white/5'
                    }`} />
                    {phase === 'processing' ? (
                      <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
                    ) : isRecording ? (
                      <Mic className="w-10 h-10 text-red-400 relative z-10" />
                    ) : isSpeaking ? (
                      <Volume2 className="w-10 h-10 text-primary relative z-10" />
                    ) : (
                      <Mic className="w-10 h-10 text-muted relative z-10" />
                    )}
                  </div>

                  <p className="text-lg font-medium mb-2 max-w-2xl mx-auto">
                    {phase === 'processing' ? 'Processing your answer...' :
                     phase === 'feedback' ? 'Reviewing your response...' :
                     phase === 'complete' ? 'Interview Complete!' :
                     isSpeaking ? 'Listen to the question...' :
                     isRecording ? 'Recording your answer...' :
                     'Ready to record your answer'}
                  </p>

                  {currentQuestion && phase !== 'complete' && (
                    <p className="text-muted text-sm max-w-xl mx-auto mt-2 italic">
                      "{currentQuestion}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 pb-4">
                  {phase === 'listening' && !isSpeaking && (
                    <Button size="lg" onClick={startRecording} className="rounded-full w-16 h-16 p-0">
                      <Mic className="w-6 h-6" />
                    </Button>
                  )}
                  {phase === 'recording' && (
                    <Button size="lg" variant="danger" onClick={stopRecording} className="rounded-full w-16 h-16 p-0">
                      <Square className="w-6 h-6" />
                    </Button>
                  )}
                  {isSpeaking && (
                    <Button size="lg" variant="secondary" disabled className="rounded-full w-16 h-16 p-0">
                      <MicOff className="w-6 h-6" />
                    </Button>
                  )}
                </div>
              </Card>

              {phase === 'feedback' && scores && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="mb-6">
                    <h3 className="font-semibold mb-4">Answer Evaluation</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {Object.entries(scores).map(([key, val]) => (
                        <div key={key} className="text-center p-3 rounded-xl bg-white/5">
                          <p className="text-2xl font-bold text-primary">{val.toFixed(0)}</p>
                          <p className="text-xs text-muted capitalize">{key.replace('_', ' ')}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted mb-2">{feedback}</p>
                    <p className="text-sm"><span className="text-accent font-medium">Ideal Answer: </span>{idealAnswer}</p>
                  </Card>
                </motion.div>
              )}

              {phase === 'complete' && (
                <Card className="text-center">
                  <h3 className="text-xl font-bold text-green-400 mb-2">Great job!</h3>
                  <p className="text-muted">Redirecting to your interview report...</p>
                </Card>
              )}

              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Play className="w-4 h-4" /> Live Transcript
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {transcript.map((entry, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-sm ${
                        entry.role === 'interviewer'
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : 'bg-accent/10 border-l-2 border-accent ml-4'
                      }`}
                    >
                      <span className="text-xs font-medium uppercase text-muted">
                        {entry.role === 'interviewer' ? 'AI Interviewer' : 'You'}
                      </span>
                      <p className="mt-1">{entry.text}</p>
                    </div>
                  ))}
                  {transcript.length === 0 && (
                    <p className="text-muted text-sm text-center py-4">Transcript will appear here during the interview</p>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
