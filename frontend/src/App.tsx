import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { Loader2 } from 'lucide-react'

// Code-split pages using React.lazy
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const InterviewPage = lazy(() => import('@/pages/InterviewPage'))
const ResumeAnalysisPage = lazy(() => import('@/pages/ResumeAnalysisPage'))
const LearnPage = lazy(() => import('@/pages/LearnPage'))
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'))
const RoadmapsPage = lazy(() => import('@/pages/RoadmapsPage'))
const PracticePage = lazy(() => import('@/pages/PracticePage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const ReportPage = lazy(() => import('@/pages/ReportPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading PrepWise AI...</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Application Shell Workspace Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
              <Route path="/resume-analysis" element={<ProtectedRoute><ResumeAnalysisPage /></ProtectedRoute>} />
              <Route path="/learn" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
              <Route path="/roadmaps" element={<ProtectedRoute><RoadmapsPage /></ProtectedRoute>} />
              <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/report/:id" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
