import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, FileText, Brain, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

const features = [
  { icon: Mic, title: 'Voice Interviews', desc: 'Practice with AI-powered voice mock interviews, not text chat' },
  { icon: FileText, title: 'Resume Analysis', desc: 'Get personalized feedback on your resume against job descriptions' },
  { icon: Brain, title: 'Adaptive Learning', desc: 'AI adapts question difficulty based on your performance' },
  { icon: Sparkles, title: 'Smart Evaluation', desc: 'Detailed scoring on technical accuracy, communication, and confidence' },
]

const steps = [
  'Upload your resume and job description',
  'Start a voice-based mock interview',
  'Answer questions using your microphone',
  'Get detailed feedback and learning recommendations',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl">PrepWise AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login"><Button variant="ghost">Login</Button></Link>
            <Link to="/register"><Button>Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-2 rounded-full glass text-sm text-accent mb-6">
              AI-Powered Voice Mock Interviews
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Ace Your Next
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Interview</span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto mb-10">
              Practice with realistic voice interviews tailored to your resume and target job.
              Get instant AI feedback and personalized learning paths.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="flex items-center gap-2">
                  Start Practicing <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login"><Button variant="secondary" size="lg">Sign In</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-hover p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto glass p-10">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-muted">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Practice?</h2>
          <p className="text-muted mb-8">Join PrepWise AI and start your voice interview preparation today.</p>
          <Link to="/register">
            <Button size="lg" className="flex items-center gap-2 mx-auto">
              <CheckCircle className="w-5 h-5" /> Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-muted text-sm">
        <p>&copy; 2026 PrepWise AI. All rights reserved.</p>
      </footer>
    </div>
  )
}
