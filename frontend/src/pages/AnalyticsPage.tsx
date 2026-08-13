import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, Award, Mic, Brain, Sparkles, CheckCircle2, AlertTriangle
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import { dashboardApi } from '@/services/api'

interface SkillMetric {
  subject: string
  score: number
  fullMark: number
}

export default function AnalyticsPage() {
  const [totalInterviews, setTotalInterviews] = useState(6)
  const [avgScore, setAvgScore] = useState(84)

  useEffect(() => {
    dashboardApi.get().then(({ data }) => {
      if (data) {
        if (data.total_interviews !== undefined) setTotalInterviews(data.total_interviews)
        if (data.average_score) setAvgScore(Math.round(data.average_score))
      }
    }).catch(() => {})
  }, [])

  const skillMetrics: SkillMetric[] = [
    { subject: 'Technical Accuracy', score: 86, fullMark: 100 },
    { subject: 'Communication Clarity', score: 90, fullMark: 100 },
    { subject: 'Speech Confidence', score: 82, fullMark: 100 },
    { subject: 'Answer Completeness', score: 78, fullMark: 100 },
    { subject: 'System Design Architecture', score: 85, fullMark: 100 },
  ]

  const historicalTrends = [
    { date: 'Session 1', score: 68 },
    { date: 'Session 2', score: 74 },
    { date: 'Session 3', score: 79 },
    { date: 'Session 4', score: 81 },
    { date: 'Session 5', score: 88 },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Performance Analytics & Radar Assessment
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry on speech metrics, score progression, and key competency balances.
          </p>
        </div>

        {/* Top Summary Ring & Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Progress Ring Card */}
          <Card className="flex flex-col items-center justify-center text-center py-6">
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200 dark:text-white/10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-indigo-500 transition-all duration-1000 ease-out"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * avgScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{avgScore}%</span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Readiness</span>
              </div>
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Overall Assessment Score</h3>
            <p className="text-xs text-slate-400 mt-1">Top 12% among peer engineering candidates</p>
          </Card>

          {/* Quick Metrics */}
          <Card className="flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
              <span className="text-xs font-semibold text-slate-400">Speech Telemetry</span>
              <Mic className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pace / Speech Rate</span>
                <span className="font-semibold text-slate-900 dark:text-white">135 WPM (Optimal)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Filler Word Rate</span>
                <span className="font-semibold text-emerald-500">1.2% (Low)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Voice Clarity Score</span>
                <span className="font-semibold text-indigo-400">92 / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Practice Time</span>
                <span className="font-semibold text-slate-900 dark:text-white">4 hrs 20 mins</span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
              <span className="text-xs font-semibold text-slate-400">Interview Volume</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{totalInterviews}</p>
              <p className="text-xs text-slate-400">Completed Voice Mock Sessions</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-xs text-indigo-500 dark:text-indigo-400 font-medium">
              ↑ +2 sessions completed this week
            </div>
          </Card>
        </div>

        {/* Competency Bars & Trend Bar Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Competencies */}
          <Card className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" /> Core Competency Scores
            </h3>
            <div className="space-y-3">
              {skillMetrics.map((item) => (
                <div key={item.subject} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{item.subject}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{item.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Historical Trend Chart */}
          <Card className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Score Improvement Trend
            </h3>
            <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-200/60 dark:border-white/10">
              {historicalTrends.map((trend) => (
                <div key={trend.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-indigo-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {trend.score}%
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(trend.score / 100) * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-lg shadow-md hover:brightness-110 transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                    {trend.date}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Recommendations Matrix */}
        <Card className="space-y-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> AI Diagnostic Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Strongest Attribute
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Clear communication structure & natural pacing. Your answers consistently apply the STAR framework for project highlights.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" /> Primary Improvement Area
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Elaborate further on trade-offs during system design scenarios (e.g. SQL vs NoSQL, consistency vs availability).
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
