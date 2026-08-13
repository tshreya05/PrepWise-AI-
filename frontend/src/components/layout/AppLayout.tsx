import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import PageTransition from './PageTransition'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Top Navbar */}
        <Navbar />

        {/* Page Content Container with Apple-Style Spring Transition */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
