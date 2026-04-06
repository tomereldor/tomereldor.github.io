'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BOOT_LINES = [
  { text: 'Loading career timeline...', delay: 0, color: '#94a3b8' },
  { text: '> 10 nodes · 15 years · 4 continents', delay: 500, color: '#22c55e' },
  { text: '> Palantir · Wiliot · IDF · Minerva · Music', delay: 900, color: '#22c55e' },
  { text: '> $100M+ enterprise impact mapped', delay: 1200, color: '#22c55e' },
  { text: 'Connecting AI assistant...', delay: 1600, color: '#94a3b8' },
  { text: '> Model ready ✓', delay: 2000, color: '#06b6d4' },
  { text: '> Knowledge base indexed ✓', delay: 2300, color: '#06b6d4' },
  { text: '', delay: 2600, color: '#94a3b8' },
  { text: '██████████████████████ 100%', delay: 2700, color: '#f59e0b' },
  { text: '', delay: 2900, color: '#94a3b8' },
  { text: 'Ready — ask me anything about Tomer.', delay: 3100, color: '#f59e0b' },
]

interface Props {
  onComplete: () => void
}

export default function BootSequence({ onComplete }: Props) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
      }, line.delay)
    })

    const totalTime = BOOT_LINES[BOOT_LINES.length - 1].delay + 800
    setTimeout(() => {
      setDone(true)
      setTimeout(onComplete, 500)
    }, totalTime)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'var(--void)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,158,11,0.04) 0%, transparent 70%)',
            }}
          />

          <div className="relative w-full max-w-2xl px-8">
            {/* ASCII Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mb-10 text-center"
            >
              <pre
                className="text-xs leading-tight font-mono"
                style={{ color: '#f59e0b', textShadow: '0 0 20px rgba(245,158,11,0.5)' }}
              >{`
  ████████╗ ██████╗ ███╗   ███╗███████╗██████╗
     ██╔══╝██╔═══██╗████╗ ████║██╔════╝██╔══██╗
     ██║   ██║   ██║██╔████╔██║█████╗  ██████╔╝
     ██║   ██║   ██║██║╚██╔╝██║██╔══╝  ██╔══██╗
     ██║   ╚██████╔╝██║ ╚═╝ ██║███████╗██║  ██║
     ╚═╝    ╚═════╝ ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
`}</pre>
              <p
                className="font-mono text-xs tracking-[0.4em] uppercase mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                AI · Solution Architect · Musical Director
              </p>
            </motion.div>

            <div className="space-y-1 font-mono text-sm">
              {BOOT_LINES.map((line, i) => (
                <div
                  key={i}
                  className="transition-all duration-150"
                  style={{
                    opacity: visibleLines.includes(i) ? 1 : 0,
                    transform: visibleLines.includes(i) ? 'translateX(0)' : 'translateX(-6px)',
                    color: line.color,
                    minHeight: '1.5rem',
                    textShadow:
                      line.color === '#f59e0b' ? '0 0 8px rgba(245,158,11,0.5)' :
                      line.color === '#06b6d4' ? '0 0 8px rgba(6,182,212,0.4)' :
                      line.color === '#22c55e' ? '0 0 8px rgba(34,197,94,0.4)' : 'none',
                  }}
                >
                  {line.text}
                </div>
              ))}
            </div>

            <motion.div
              className="mt-8 h-px w-full"
              style={{ background: 'var(--border)' }}
            >
              <motion.div
                className="h-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(visibleLines.length / BOOT_LINES.length) * 100}%` }}
                style={{
                  background: 'linear-gradient(90deg, #f59e0b, #06b6d4)',
                  boxShadow: '0 0 8px rgba(245,158,11,0.6)',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
