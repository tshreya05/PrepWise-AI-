import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, FileText, Brain, Sparkles, ArrowRight, CheckCircle2, ChevronDown,
  ShieldCheck, Zap, Award, Star, Activity, BarChart3, Layers
} from 'lucide-react'
import Grainient from '@/components/ui/Grainient'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'

const features = [
  {
    icon: Mic,
    title: 'Voice-First AI Interviewer',
    desc: 'Speak your answers naturally using your microphone. Our speech model analyzes tone, confidence, and technical content in real-time.',
    badge: 'Voice RAG',
  },
  {
    icon: FileText,
    title: 'Resume & JD Intelligence',
    desc: 'Deep RAG contextual analysis extracts your skills and matches them against target job descriptions for hyper-relevant question framing.',
    badge: 'FAISS Vector',
  },
  {
    icon: Brain,
    title: 'Adaptive Difficulty AI',
    desc: 'The interview adapts on the fly. Exceptional responses unlock senior-level follow ups, while weak areas trigger guided foundational questions.',
    badge: 'Adaptive',
  },
  {
    icon: Sparkles,
    title: '4-Metric Evaluation',
    desc: 'Instant scoring across Technical Accuracy, Communication, Confidence, and Completeness with comprehensive ideal answer comparisons.',
    badge: 'Instant Feedback',
  },
  {
    icon: Layers,
    title: 'Career Skill Roadmaps',
    desc: 'Interactive skill graph trees inspired by roadmap.sh to help you master missing technical competencies step-by-step.',
    badge: 'Roadmaps',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Practice Quizzes',
    desc: 'Track score progression, radar skill balances, and launch AI-generated MCQ practice quizzes targeted directly at weak topics.',
    badge: 'Analytics',
  },
]

const steps = [
  {
    num: '01',
    title: 'Upload Resume & Job Description',
    desc: 'Drag & drop your PDF/DOCX resume and paste the target job description to build a custom vector index.',
  },
  {
    num: '02',
    title: 'Begin Voice Mock Session',
    desc: 'The AI interviewer speaks realistic technical & behavioral questions tailored to your experience.',
  },
  {
    num: '03',
    title: 'Answer via Microphone',
    desc: 'Speak naturally. Real-time audio processing transcribes and analyzes your responses with low latency.',
  },
  {
    num: '04',
    title: 'Receive Comprehensive Report',
    desc: 'Get an overall score, strengths/weaknesses breakdown, ideal answer guidelines, and personalized learning cards.',
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior Frontend Engineer',
    company: 'Landed at Tech Corp',
    text: 'PrepWise AI was a game changer for my system design interview. Practicing out loud with immediate feedback built my confidence tremendously.',
    avatar: 'SC',
    rating: 5,
  },
  {
    name: 'Alex Rivera',
    role: 'Full Stack Developer',
    company: 'Landed at FinTech Startup',
    text: 'The voice interface feels like a real interview with a Tech Lead. The resume RAG analysis correctly identified keywords missing from my profile.',
    avatar: 'AR',
    rating: 5,
  },
  {
    name: 'David K.',
    role: 'AI Engineer',
    company: 'Landed at Enterprise AI',
    text: 'The adaptive question engine kept pushing my limits. The feedback reports gave clear, actionable bullet points to improve.',
    avatar: 'DK',
    rating: 5,
  },
]

const faqs = [
  {
    q: 'Is PrepWise AI really voice-only or text chat?',
    a: 'PrepWise AI is engineered for voice mock interviews. The AI speaks questions aloud using natural TTS, and you speak your answers directly into your microphone using real-time Speech-to-Text processing.',
  },
  {
    q: 'How does resume matching work?',
    a: 'When you upload your resume and job description, our backend indexes them into a FAISS vector store. Questions are retrieved dynamically using RAG to evaluate your actual project experience against the specific role.',
  },
  {
    q: 'Can I practice both technical and behavioral interviews?',
    a: 'Yes! PrepWise AI supports 4 distinct interview tracks: Technical (Coding & Architecture), Behavioral (STAR method), Projects Deep Dive, and HR / Culture fit.',
  },
  {
    q: 'Is there a free trial available?',
    a: 'Yes, you can register a free account right now to conduct mock interviews, run resume ATS analysis, and explore personalized learning cards.',
  },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 selection:text-indigo-300 overflow-hidden">
      {/* Top Floating Glass Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 backdrop-blur-xl bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              PrepWise <span className="text-indigo-400">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="shadow-lg shadow-indigo-500/25">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Signature React Bits Grainient Background */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden">
        {/* Full-screen WebGL Shader Canvas */}
        <div className="absolute inset-0 z-0 opacity-80">
          <Grainient
            color1="#4F46E5"
            color2="#06B6D4"
            color3="#0F172A"
            timeSpeed={0.2}
            warpStrength={1.2}
            warpFrequency={4.0}
            grainAmount={0.08}
            zoom={0.85}
          />
        </div>

        {/* Ambient Dark Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xl backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Next-Gen Voice-First Interview SaaS</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Ace Your Next <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-300 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Voice Interview
              </span>{' '}
              with AI
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Practice realistic technical and behavioral voice interviews tailored to your resume.
              Get instant scoring, speech breakdown, and personalized career roadmaps.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-4 shadow-xl shadow-indigo-500/30">
                  <span>Start Practicing Now</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base px-8 py-4">
                  <span>Explore Demo</span>
                </Button>
              </Link>
            </div>

            {/* Floating Glass Dashboard Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative max-w-4xl mx-auto glass rounded-3xl border border-white/20 p-6 md:p-8 shadow-2xl backdrop-blur-2xl bg-slate-900/70 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-mono text-slate-400">PrepWise Voice Assistant v2.4</span>
                </div>
                <Badge variant="success" size="sm">
                  <Activity className="w-3 h-3" /> Live Audio Processing
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Interview Readiness</span>
                    <Award className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">92%</p>
                  <p className="text-[11px] text-emerald-400 mt-1">↑ +8% from last mock session</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Audio Evaluation</span>
                    <Mic className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">Clear & Fluent</p>
                  <p className="text-[11px] text-slate-400 mt-1">Confidence Score: 88/100</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Target Role</span>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-lg font-bold text-white truncate">Full Stack Architect</p>
                  <p className="text-[11px] text-indigo-300 mt-1">5 Weak Skills Identified</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Statistics Counter Banner */}
      <section className="py-12 border-y border-white/10 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-indigo-400">98.4%</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Evaluation Accuracy</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-cyan-400">50,000+</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Voice Mock Sessions</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-emerald-400">4.9 / 5.0</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Candidate Satisfaction</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-amber-400">15+ Roles</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Engineering Tracks</p>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="primary" size="md" className="mb-4">
            Powerful Modules
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Engineered for Modern Engineering Candidates
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            Everything you need to master technical voice interviews, optimize your resume ATS alignment, and bridge skill gaps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hover className="h-full bg-slate-900/60 border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <f.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <Badge variant="accent" size="sm">{f.badge}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Workflow Visualization */}
      <section id="workflow" className="py-24 px-6 bg-slate-900/40 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="accent" size="md" className="mb-4">
              Step-by-Step AI Engine
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How PrepWise AI Works
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base">
              A seamless 4-step workflow that transforms your preparation into actual job offers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <Card key={step.num} className="bg-slate-900/80 border-white/10 relative overflow-hidden">
                <span className="text-4xl font-black text-indigo-500/20 absolute top-4 right-4">
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 font-bold text-sm">
                  {step.num}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="success" size="md" className="mb-4">
            Candidate Success
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Trusted by Top Software Engineers
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            See how candidates used PrepWise AI to land positions at top tier tech companies.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="bg-slate-900/60 border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 italic mb-6">"{t.text}"</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role} • <span className="text-indigo-400">{t.company}</span></p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive FAQ Accordion Section */}
      <section id="faq" className="py-24 px-6 bg-slate-900/40 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="neutral" size="md" className="mb-4">
              Got Questions?
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl border border-white/10 overflow-hidden bg-slate-900/70"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-semibold text-sm text-white hover:text-indigo-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Placeholder */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto text-center">
        <Badge variant="primary" size="md" className="mb-4">
          Flexible Plans
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-base mb-12">
          Start for free, then upgrade as you prepare for upcoming interview rounds.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-slate-900/60 border-white/10 text-left flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Free Starter</h3>
              <p className="text-3xl font-extrabold text-white mb-4">$0 <span className="text-xs font-normal text-slate-400">/ month</span></p>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3 Voice Mock Sessions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Basic Resume Analysis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standard Learning Cards</li>
              </ul>
            </div>
            <Link to="/register"><Button variant="secondary" className="w-full">Get Started Free</Button></Link>
          </Card>

          <Card className="bg-gradient-to-b from-indigo-900/40 to-slate-900/90 border-indigo-500/50 text-left flex flex-col justify-between relative shadow-2xl">
            <Badge variant="primary" size="sm" className="absolute top-4 right-4">Popular</Badge>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Pro Prep</h3>
              <p className="text-3xl font-extrabold text-white mb-4">$19 <span className="text-xs font-normal text-slate-400">/ month</span></p>
              <ul className="space-y-2 text-xs text-slate-200 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Unlimited Voice Interviews</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Deep FAISS RAG Resume Alignment</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Adaptive Questioning Engine</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Unlimited MCQ Practice Quizzes</li>
              </ul>
            </div>
            <Link to="/register"><Button className="w-full">Upgrade to Pro</Button></Link>
          </Card>

          <Card className="bg-slate-900/60 border-white/10 text-left flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Enterprise</h3>
              <p className="text-3xl font-extrabold text-white mb-4">Custom</p>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Custom Team Rubrics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Dedicated API & Webhooks</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> SLA & Security Compliance</li>
              </ul>
            </div>
            <Link to="/register"><Button variant="secondary" className="w-full">Contact Sales</Button></Link>
          </Card>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-900/50 via-slate-900 to-violet-900/50 border-t border-white/10 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Pass Your Technical Interview?
          </h2>
          <p className="text-slate-300 mb-8 text-base">
            Join thousands of candidates using PrepWise AI voice simulation to build confidence and land their dream offers.
          </p>
          <Link to="/register">
            <Button size="lg" className="px-8 py-4 text-base shadow-2xl shadow-indigo-500/40">
              <ShieldCheck className="w-5 h-5 mr-2" /> Start Free Voice Mock Interview
            </Button>
          </Link>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white">PrepWise AI</span>
          </div>
          <p>&copy; {new Date().getFullYear()} PrepWise AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
