import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Play, Square, Volume2, Loader2, FileText, Briefcase, Sparkles, AlertCircle
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Waveform from '@/components/interview/Waveform'
import Timer from '@/components/interview/Timer'
import { interviewApi, dashboardApi } from '@/services/api'

type InterviewPhase = 'setup' | 'listening' | 'recording' | 'processing' | 'feedback' | 'complete'

const INTERVIEW_TYPES = [
  { id: 'technical', label: 'Technical', desc: 'Coding, system design, data structures, and architecture' },
  { id: 'behavioral', label: 'Behavioral', desc: 'STAR method, leadership, conflict resolution, and teamwork' },
  { id: 'projects', label: 'Projects', desc: 'Deep dive into your resume experience and project architecture' },
  { id: 'hr', label: 'HR & Fit', desc: 'Culture fit, career trajectory, motivations, and salary expectations' },
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
  const [contextModalOpen, setContextModalOpen] = useState(false)
  const [resumePreview, setResumePreview] = useState<string>('')
  const [jdPreview, setJdPreview] = useState<string>('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    dashboardApi.get().then(({ data }) => {
      if (data?.resume?.filename) {
        setResumePreview(`File: ${data.resume.filename} • Skills: ${(data.resume.skills || []).join(', ')}`)
      }
      if (data?.job_description?.preview) {
        setJdPreview(data.job_description.preview)
      }
    }).catch(() => {})
  }, [])

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
      setError(msg || 'Failed to start interview. Please ensure your resume is uploaded first.')
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
      setError('Microphone access denied. Please allow microphone permissions in your browser.')
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
        setTimeout(() => navigate(`/report/${interviewId}`), 2500)
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
      setError('Failed to process your response. Please retry recording.')
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mic className="w-6 h-6 text-rose-500" />
              AI Voice Interview Room
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Speak your answers naturally into your microphone.
            </p>
          </div>

          {phase !== 'setup' && (
            <Button variant="secondary" size="sm" onClick={() => setContextModalOpen(true)}>
              <FileText className="w-4 h-4 mr-1.5 text-indigo-400" /> Context Reference
            </Button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl glass border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Phase 1: Setup Track Selector */}
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="space-y-6">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                    Select Interview Track
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The AI interviewer will frame questions based on your selected target domain.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {INTERVIEW_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setInterviewType(t.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        interviewType === t.id
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                          : 'border-slate-200/80 dark:border-white/10 glass hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{t.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
                    </button>
                  ))}
                </div>

                <Button size="lg" className="w-full justify-center shadow-xl shadow-indigo-500/30" onClick={startInterview}>
                  <Mic className="w-5 h-5 mr-2" /> Start Voice Session
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Phase 2: Live Conversation Console */}
          {phase !== 'setup' && (
            <motion.div key="interview-room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="relative overflow-hidden text-center py-8">
                {/* Top Status Bar */}
                <div className="absolute top-4 right-4 flex items-center gap-3">
                  <Timer isRunning={phase === 'recording' || phase === 'listening'} />
                  <Badge variant="primary" size="sm">
                    Q{questionIndex + 1} / {totalQuestions}
                  </Badge>
                </div>

                {/* Audio Waveform Canvas */}
                <Waveform isActive={isSpeaking || isRecording} className="mb-6" />

                {/* Animated Central Speaker Mic Circle */}
                <div className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center relative">
                  <div
                    className={`absolute inset-0 rounded-full transition-all ${
                      isRecording
                        ? 'bg-rose-500/20 animate-ping'
                        : isSpeaking
                        ? 'bg-indigo-500/20 animate-pulse'
                        : 'bg-slate-200/50 dark:bg-white/5'
                    }`}
                  />
                  <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center relative z-10 shadow-2xl">
                    {phase === 'processing' ? (
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    ) : isRecording ? (
                      <Mic className="w-8 h-8 text-rose-500" />
                    ) : isSpeaking ? (
                      <Volume2 className="w-8 h-8 text-indigo-400 animate-pulse" />
                    ) : (
                      <Mic className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                </div>

                <p className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                  {phase === 'processing'
                    ? 'AI Evaluating Response & Generating Audio...'
                    : phase === 'feedback'
                    ? 'Reviewing Your Answer...'
                    : phase === 'complete'
                    ? 'Voice Interview Completed!'
                    : isSpeaking
                    ? 'AI Interviewer Speaking...'
                    : isRecording
                    ? 'Recording Your Answer (Speak now)...'
                    : 'Ready to Record Answer'}
                </p>

                {currentQuestion && phase !== 'complete' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2 italic px-4">
                    "{currentQuestion}"
                  </p>
                )}

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 pt-6">
                  {phase === 'listening' && !isSpeaking && (
                    <Button size="lg" onClick={startRecording} className="rounded-full w-16 h-16 p-0 justify-center bg-rose-600 hover:bg-rose-500">
                      <Mic className="w-7 h-7 text-white" />
                    </Button>
                  )}
                  {phase === 'recording' && (
                    <Button size="lg" variant="danger" onClick={stopRecording} className="rounded-full w-16 h-16 p-0 justify-center">
                      <Square className="w-7 h-7" />
                    </Button>
                  )}
                  {isSpeaking && (
                    <Button size="lg" variant="secondary" disabled className="rounded-full w-16 h-16 p-0 justify-center">
                      <MicOff className="w-7 h-7 text-slate-400" />
                    </Button>
                  )}
                </div>
              </Card>

              {/* Evaluation Breakdown Box */}
              {phase === 'feedback' && scores && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" /> Real-time Response Scoring
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(scores).map(([key, val]) => (
                        <div key={key} className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{val.toFixed(0)}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold mt-1">
                            {key.replace('_', ' ')}
                          </p>
                        </div>
                      ))}
                    </div>
                    {feedback && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feedback}</p>}
                    {idealAnswer && (
                      <div className="p-3 rounded-xl bg-indigo-500/10 text-xs text-indigo-900 dark:text-indigo-200">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Ideal Guidance: </span>
                        {idealAnswer}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* Live Speech Transcript */}
              <Card className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-400" /> Live Transcript Flow
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {transcript.map((entry, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        entry.role === 'interviewer'
                          ? 'bg-indigo-500/10 border-l-2 border-indigo-500 text-slate-800 dark:text-slate-200'
                          : 'bg-cyan-500/10 border-l-2 border-cyan-400 text-slate-800 dark:text-slate-200 ml-4'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {entry.role === 'interviewer' ? 'AI Interviewer' : 'Candidate (You)'}
                      </span>
                      <p>{entry.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context Reference Modal */}
        <Modal isOpen={contextModalOpen} onClose={() => setContextModalOpen(false)} title="Resume & Job Context Reference">
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" /> Uploaded Resume
              </p>
              <p className="p-3 rounded-xl bg-slate-100 dark:bg-white/5">{resumePreview || 'No resume uploaded yet.'}</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-cyan-400" /> Target Job Description
              </p>
              <p className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 leading-relaxed">{jdPreview || 'No job description uploaded yet.'}</p>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  )
}
