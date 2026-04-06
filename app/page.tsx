'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Brain, MessageCircle, Activity, Mail, Music } from 'lucide-react'
import BootSequence from '@/components/BootSequence'
import ParticleField from '@/components/ParticleField'
import KnowledgeGraph from '@/components/KnowledgeGraph'
import ChatTerminal from '@/components/ChatTerminal'
import { CAREER_NODES } from '@/lib/resume-data'

function ContactButton({
  href,
  icon,
  label,
  color,
}: {
  href: string
  icon: React.ReactNode
  label: string
  color: string
}) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-medium transition-all duration-200"
      style={{
        background: `${color}0f`,
        border: `1px solid ${color}28`,
        color: `${color}88`,
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}1e`
        e.currentTarget.style.borderColor = `${color}55`
        e.currentTarget.style.color = `${color}ee`
        e.currentTarget.style.boxShadow = `0 0 12px ${color}22`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `${color}0f`
        e.currentTarget.style.borderColor = `${color}28`
        e.currentTarget.style.color = `${color}88`
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {icon}
      {label}
    </a>
  )
}

export default function Home() {
  const [booted, setBooted] = useState(false)
  const [activeNodes, setActiveNodes] = useState<string[]>([])
  const [latency, setLatency] = useState<number | null>(null)
  const [sessionMsgs, setSessionMsgs] = useState(0)

  // 3D parallax for graph panel
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-7, 7]), { stiffness: 75, damping: 28 })
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [5, -5]), { stiffness: 75, damping: 28 })

  const graphPanelRef = useRef<HTMLDivElement>(null)

  const handleGraphMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = graphPanelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }, [mouseX, mouseY])

  const handleGraphMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  const handleNodesChange = useCallback((nodes: string[]) => {
    setActiveNodes(nodes)
    if (nodes.length > 0) setSessionMsgs(prev => prev + 1)
  }, [])

  const handleLatencyChange = useCallback((ms: number) => setLatency(ms), [])

  const handleNodeClick = useCallback((id: string) => {
    setActiveNodes(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    )
  }, [])

  return (
    <main className="relative h-screen flex flex-col overflow-hidden" style={{ background: 'var(--void)' }}>
      <ParticleField />

      {/* Ambient gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 25% 10%, rgba(245,158,11,0.04) 0%, transparent 60%),' +
            'radial-gradient(ellipse 40% 30% at 75% 85%, rgba(6,182,212,0.03) 0%, transparent 60%)',
          zIndex: 1,
        }}
      />

      <BootSequence onComplete={() => setBooted(true)} />

      <AnimatePresence>
        {booted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="relative flex flex-col h-full"
            style={{ zIndex: 2 }}
          >
            {/* ── Header ──────────────────────────────────────── */}
            <header
              className="flex-shrink-0 flex items-center justify-between px-5 py-3 gap-4"
              style={{
                background: 'rgba(10,15,30,0.92)',
                backdropFilter: 'blur(14px)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {/* Left: name + tagline */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex gap-1.5 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444', opacity: 0.65 }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b', opacity: 0.65 }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e', opacity: 0.65 }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1
                      className="font-mono text-sm font-semibold tracking-wider whitespace-nowrap"
                      style={{ color: 'var(--amber)', textShadow: '0 0 10px rgba(245,158,11,0.35)' }}
                    >
                      TOMER ELDOR
                    </h1>
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>//</span>
                    <span className="font-mono text-xs whitespace-nowrap" style={{ color: 'rgba(6,182,212,0.6)' }}>
                      AI Portfolio
                    </span>
                  </div>
                  <p className="font-mono text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    Ex-Palantir · ML Solution Architect · Musical Director
                  </p>
                </div>
              </div>

              {/* Right: contact buttons + status */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <ContactButton
                  href="https://www.linkedin.com/in/tomere"
                  icon={<span style={{ fontSize: 13, fontWeight: 700 }}>in</span>}
                  label="LinkedIn"
                  color="#0077b5"
                />
                <ContactButton
                  href="mailto:tomer.eldor@gmail.com"
                  icon={<Mail size={14} />}
                  label="Email"
                  color="#f59e0b"
                />
                <ContactButton
                  href="https://www.tomereldor.com"
                  icon={<Music size={14} />}
                  label="Music"
                  color="#e879f9"
                />

                {/* Online indicator */}
                <div className="flex items-center gap-1.5 ml-2">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#22c55e' }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  />
                  <span className="font-mono text-xs" style={{ color: '#22c55e', textShadow: '0 0 4px rgba(34,197,94,0.4)' }}>
                    LIVE
                  </span>
                </div>
              </div>
            </header>

            {/* ── Main panels ─────────────────────────────────── */}
            <div className="flex-1 flex min-h-0">
              {/* Left: Knowledge Graph — 50% */}
              <motion.div
                ref={graphPanelRef}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className="flex-shrink-0 flex flex-col"
                style={{
                  width: '50%',
                  borderRight: '1px solid var(--border)',
                  background: 'rgba(10,15,30,0.55)',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseMove={handleGraphMouseMove}
                onMouseLeave={handleGraphMouseLeave}
              >
                {/* Panel header */}
                <div
                  className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <Brain size={12} style={{ color: 'rgba(245,158,11,0.55)' }} />
                    <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                      Career Timeline
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {CAREER_NODES.length} nodes
                    </span>
                    <AnimatePresence>
                      {activeNodes.length > 0 && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="font-mono text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.22)',
                            color: 'rgba(245,158,11,0.75)',
                          }}
                        >
                          {activeNodes.length} lit
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 3D parallax graph */}
                <div className="flex-1 min-h-0 p-4 overflow-y-auto" style={{ perspective: '900px' }}>
                  <motion.div
                    style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                    className="h-full"
                  >
                    <KnowledgeGraph
                      activeNodes={activeNodes}
                      onNodeClick={handleNodeClick}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Right: Chat — 50% */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.45 }}
                className="flex-1 flex flex-col min-w-0"
                style={{
                  background: 'rgba(8,12,22,0.65)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Chat header */}
                <div
                  className="flex-shrink-0 flex items-center justify-between px-5 py-2.5"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle size={12} style={{ color: 'rgba(6,182,212,0.55)' }} />
                    <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                      Ask Tomer's AI
                    </span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {process.env.NEXT_PUBLIC_MODEL_LABEL ?? 'claude · haiku'}
                  </span>
                </div>

                <div className="flex-1 min-h-0 px-5 py-4 flex flex-col">
                  <ChatTerminal
                    onNodesChange={handleNodesChange}
                    onLatencyChange={handleLatencyChange}
                  />
                </div>
              </motion.div>
            </div>

            {/* ── Status bar ──────────────────────────────────── */}
            <footer
              className="flex-shrink-0 flex items-center justify-between px-5 py-1.5"
              style={{
                background: 'rgba(10,15,30,0.96)',
                borderTop: '1px solid var(--border)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Activity size={10} style={{ color: 'rgba(34,197,94,0.5)' }} />
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    AI portfolio · streaming
                  </span>
                </div>
                {latency && (
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {latency}ms
                  </span>
                )}
                {sessionMsgs > 0 && (
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {sessionMsgs} {sessionMsgs === 1 ? 'exchange' : 'exchanges'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  London · Paris
                </span>
                <span className="font-mono text-xs" style={{ color: 'rgba(245,158,11,0.3)' }}>
                  tomer.eldor@gmail.com
                </span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
