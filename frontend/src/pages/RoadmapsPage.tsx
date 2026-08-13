import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Map, CheckCircle2, Clock, Brain, Sparkles, Award, Lock, Play
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface SkillNode {
  id: string
  title: string
  desc: string
  status: 'completed' | 'in-progress' | 'locked'
  estimatedHours: number
  readinessImpact: string
  dependencies: string[]
}

interface RoadmapTrack {
  id: string
  title: string
  desc: string
  nodes: SkillNode[]
}

const roadmaps: RoadmapTrack[] = [
  {
    id: 'fullstack',
    title: 'Fullstack Web Engineer',
    desc: 'Master React, Async Python FastAPI, SQL optimization, and cloud deployments.',
    nodes: [
      {
        id: 'fs-1',
        title: 'Modern React Architecture & Hooks',
        desc: 'Custom hooks, Context API performance, useMemo/useCallback optimization, and SSR.',
        status: 'completed',
        estimatedHours: 8,
        readinessImpact: '+15%',
        dependencies: [],
      },
      {
        id: 'fs-2',
        title: 'Async Python & FastAPI Microservices',
        desc: 'Event loops, coroutines, Pydantic schemas, dependency injection, and JWT auth.',
        status: 'in-progress',
        estimatedHours: 12,
        readinessImpact: '+20%',
        dependencies: ['fs-1'],
      },
      {
        id: 'fs-3',
        title: 'Database Indexing & Query Tuning',
        desc: 'B-Trees, composite indexes, query execution plans, and N+1 query prevention.',
        status: 'locked',
        estimatedHours: 10,
        readinessImpact: '+18%',
        dependencies: ['fs-2'],
      },
      {
        id: 'fs-4',
        title: 'Distributed System Design & Caching',
        desc: 'Redis caching, load balancing, message queues, and API rate limiting.',
        status: 'locked',
        estimatedHours: 16,
        readinessImpact: '+25%',
        dependencies: ['fs-3'],
      },
    ],
  },
  {
    id: 'ai-eng',
    title: 'AI & LLM Application Engineer',
    desc: 'RAG pipelines, FAISS vector indexing, prompt engineering, and model evaluation.',
    nodes: [
      {
        id: 'ai-1',
        title: 'Prompt Engineering & Structured Outputs',
        desc: 'Chain of thought, JSON schema forcing, and temperature tuning.',
        status: 'completed',
        estimatedHours: 6,
        readinessImpact: '+12%',
        dependencies: [],
      },
      {
        id: 'ai-2',
        title: 'Vector Embeddings & FAISS Indexing',
        desc: 'Cosine similarity, HNSW indexing, chunking strategies, and hybrid retrieval.',
        status: 'in-progress',
        estimatedHours: 14,
        readinessImpact: '+22%',
        dependencies: ['ai-1'],
      },
      {
        id: 'ai-3',
        title: 'Speech-to-Text & Realtime Audio Pipelines',
        desc: 'WebSockets, Web Audio API, audio chunking, and STT streaming latency reduction.',
        status: 'locked',
        estimatedHours: 15,
        readinessImpact: '+25%',
        dependencies: ['ai-2'],
      },
    ],
  },
]

export default function RoadmapsPage() {
  const [activeTrackId, setActiveTrackId] = useState<string>('fullstack')
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(roadmaps[0].nodes[1])

  const activeTrack = roadmaps.find(r => r.id === activeTrackId) || roadmaps[0]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-500" />
            Interactive Career Roadmaps
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Inspired by roadmap.sh — track node dependencies, completion, and practice targeted quizzes.
          </p>
        </div>

        {/* Track Selection Tabs */}
        <div className="flex gap-3 border-b border-slate-200/60 dark:border-white/10 pb-3">
          {roadmaps.map(track => (
            <button
              key={track.id}
              onClick={() => {
                setActiveTrackId(track.id)
                setSelectedNode(track.nodes[0])
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTrackId === track.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {track.title}
            </button>
          ))}
        </div>

        {/* Graph Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Skill Nodes Flow Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl glass border border-slate-200/80 dark:border-white/10 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{activeTrack.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeTrack.desc}</p>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-500/20">
              {activeTrack.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id
                return (
                  <motion.div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    whileHover={{ x: 4 }}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10'
                        : 'glass border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {/* Node Dot on Timeline Line */}
                    <div
                      className={`absolute -left-[31px] top-6 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        node.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : node.status === 'in-progress'
                          ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-800 border-slate-400 text-slate-500'
                      }`}
                    >
                      {node.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {node.status === 'in-progress' && <Sparkles className="w-2.5 h-2.5" />}
                      {node.status === 'locked' && <Lock className="w-2.5 h-2.5" />}
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{node.title}</h3>
                      <Badge
                        variant={
                          node.status === 'completed'
                            ? 'success'
                            : node.status === 'in-progress'
                            ? 'primary'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {node.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{node.desc}</p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> ~{node.estimatedHours} hrs
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-500">
                        <Award className="w-3.5 h-3.5" /> Readiness {node.readinessImpact}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Node Details & Practice Launcher Panel */}
          <div>
            {selectedNode && (
              <Card className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                  <Badge variant="primary" size="sm">Skill Inspector</Badge>
                  <span className="text-xs font-semibold text-indigo-500">{selectedNode.readinessImpact} Boost</span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                    {selectedNode.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {selectedNode.desc}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className="font-semibold capitalize text-indigo-500">{selectedNode.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Time</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedNode.estimatedHours} hours</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link to="/practice">
                    <Button size="sm" className="w-full justify-center">
                      <Brain className="w-4 h-4 mr-1.5" /> Launch Practice Quiz
                    </Button>
                  </Link>

                  <Link to="/interview">
                    <Button variant="secondary" size="sm" className="w-full justify-center">
                      <Play className="w-4 h-4 mr-1.5 text-rose-500" /> Practice in Voice Room
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
