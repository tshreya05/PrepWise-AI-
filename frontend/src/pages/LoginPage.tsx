import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Grainient from '@/components/ui/Grainient'
import { authApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login({ email, password })
      login(data.access_token)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-slate-950 text-white overflow-hidden">
      {/* Background WebGL Accent */}
      <div className="absolute inset-0 opacity-40">
        <Grainient
          color1="#4F46E5"
          color2="#06B6D4"
          color3="#0F172A"
          timeSpeed={0.15}
          zoom={0.9}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md glass rounded-3xl border border-white/15 p-8 backdrop-blur-2xl bg-slate-900/80 shadow-2xl space-y-6"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to resume your voice mock interview preparation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full justify-center text-sm py-3" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
            Register Now
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
