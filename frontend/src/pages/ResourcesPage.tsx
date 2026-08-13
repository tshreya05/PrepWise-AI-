import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Search, ExternalLink, Clock, Bookmark, Filter, FileText
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { learnApi } from '@/services/api'

interface ResourceItem {
  id: number
  title: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  readingTime: string
  url: string
  summary: string
  bookmarked?: boolean
}

const defaultResources: ResourceItem[] = [
  {
    id: 1,
    title: 'System Design Primer & High Availability Systems',
    category: 'System Design',
    difficulty: 'Advanced',
    readingTime: '15 min read',
    url: 'https://github.com/donnemartin/system-design-primer',
    summary: 'Master key system design principles: load balancing, microservices, caching strategies, and database sharding.',
  },
  {
    id: 2,
    title: 'React 18 Concurrent Rendering & Server Components',
    category: 'Frontend',
    difficulty: 'Intermediate',
    readingTime: '10 min read',
    url: 'https://react.dev/blog/2022/03/29/react-v18',
    summary: 'In-depth guide on React 18 automatic batching, transitions, suspense for data fetching, and Server Components architecture.',
  },
  {
    id: 3,
    title: 'FastAPI High Performance Async & Pydantic V2',
    category: 'Backend',
    difficulty: 'Intermediate',
    readingTime: '12 min read',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    summary: 'Build production-ready async Python microservices with strict schema validation and automated OpenAPI docs.',
  },
  {
    id: 4,
    title: 'Vector Databases, Embeddings & RAG Architecture',
    category: 'AI & Machine Learning',
    difficulty: 'Advanced',
    readingTime: '20 min read',
    url: 'https://faiss.ai/',
    summary: 'Comprehensive overview of vector similarity search using FAISS, dense passage retrieval, and RAG optimization.',
  },
  {
    id: 5,
    title: 'Behavioral Interview Masterclass (STAR Method)',
    category: 'Behavioral',
    difficulty: 'Beginner',
    readingTime: '8 min read',
    url: 'https://www.google.com/search?q=star+method+interview',
    summary: 'Structure your leadership, conflict management, and project execution answers using Situation, Task, Action, Result.',
  },
]

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>(defaultResources)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([1, 4])
  const [activeDoc, setActiveDoc] = useState<ResourceItem | null>(null)

  useEffect(() => {
    learnApi.getCards().then(({ data }) => {
      if (Array.isArray(data) && data.length > 0) {
        const fetched: ResourceItem[] = data.flatMap((card: { resources?: Array<{ title: string; url: string; type: string }>; topic?: string }, idx: number) => {
          return (card.resources || []).map((r, rIdx) => ({
            id: 100 + idx * 10 + rIdx,
            title: r.title,
            category: card.topic || 'General',
            difficulty: 'Intermediate',
            readingTime: '10 min read',
            url: r.url,
            summary: `Personalized recommendation for ${card.topic || 'interview practice'}.`,
          }))
        })
        if (fetched.length > 0) {
          setResources([...defaultResources, ...fetched])
        }
      }
    }).catch(() => {})
  }, [])

  const categories = ['All', 'System Design', 'Frontend', 'Backend', 'AI & Machine Learning', 'Behavioral']

  const toggleBookmark = (id: number) => {
    setBookmarkedIds(prev =>
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    )
  }

  const filtered = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" />
              Developer Resources & Documentation
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Curated tech guides, architecture papers, and interview prep cheat sheets.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-white/10">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resource Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isBookmarked = bookmarkedIds.includes(item.id)
            return (
              <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card hover className="h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="primary" size="sm">{item.category}</Badge>
                      <button
                        onClick={() => toggleBookmark(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked
                            ? 'text-amber-500 bg-amber-500/10'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        aria-label="Bookmark resource"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{item.readingTime}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveDoc(item)}
                        className="px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 font-medium"
                      >
                        Quick Read
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No resources match your current filter.</p>
          </Card>
        )}
      </div>

      {/* Quick Read Modal */}
      <Modal
        isOpen={Boolean(activeDoc)}
        onClose={() => setActiveDoc(null)}
        title={activeDoc?.title}
        maxWidth="xl"
      >
        {activeDoc && (
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{activeDoc.category}</Badge>
              <Badge variant="neutral">{activeDoc.difficulty}</Badge>
              <span className="text-xs text-slate-400 ml-auto">{activeDoc.readingTime}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 text-xs leading-relaxed space-y-2">
              <p className="font-semibold text-slate-900 dark:text-white">Summary Overview:</p>
              <p>{activeDoc.summary}</p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                This documentation provides essential concepts required for high performance in PrepWise AI voice interview evaluations.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveDoc(null)}>
                Close
              </Button>
              <a href={activeDoc.url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="flex items-center gap-1.5">
                  Open External Source <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  )
}
