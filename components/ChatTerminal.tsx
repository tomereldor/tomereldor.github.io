'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Zap, Sparkles, ChevronRight } from 'lucide-react'
import { NODE_MAP } from '@/lib/resume-data'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  streaming?: boolean
}

interface Meta {
  nodes: string[]
  relevance: number
  highlights: string[]
}

interface Props {
  onNodesChange: (nodes: string[]) => void
  onLatencyChange: (ms: number) => void
}

const SUGGESTED_QUESTIONS = [
  'What makes Tomer\'s AI architecture experience unique?',
  'Tell me about the Palantir Agora project',
  'How does he combine technical depth with business impact?',
  'What\'s his experience deploying LLMs at enterprise scale?',
  'How did he go from IDF to Palantir to frontier AI?',
  'What\'s the story behind his music and peacebuilding work?',
]

const SYSTEM_INTRO: Message = {
  id: 'intro',
  role: 'system',
  content: 'Hi — I\'m Tomer\'s AI assistant. I know his full career inside out: from IDF intelligence to Palantir to frontier AI deployment. Ask me anything.',
}

function renderMarkdown(text: string): React.ReactNode[] {
  const segments = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return segments.flatMap((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return [<strong key={i} className="font-semibold text-slate-100">{seg.slice(2, -2)}</strong>]
    }
    if (seg.startsWith('*') && seg.endsWith('*')) {
      return [<em key={i} className="italic">{seg.slice(1, -1)}</em>]
    }
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return [
        <code key={i} className="font-mono text-xs px-1 py-0.5 rounded"
          style={{ background: 'rgba(6,182,212,0.1)', color: '#67e8f9' }}>
          {seg.slice(1, -1)}
        </code>
      ]
    }
    return seg.split('\n').flatMap((line, j, arr) =>
      j < arr.length - 1 ? [<span key={`${i}-${j}`}>{line}</span>, <br key={`${i}-${j}-br`} />] : [<span key={`${i}-${j}`}>{line}</span>]
    )
  })
}

function StreamingText({ text, streaming }: { text: string; streaming: boolean }) {
  return (
    <span>
      {renderMarkdown(text)}
      {streaming && (
        <span
          className="inline-block w-1.5 h-3.5 ml-0.5 align-middle rounded-sm"
          style={{ background: 'var(--amber)', animation: 'blink 0.8s step-end infinite' }}
        />
      )}
    </span>
  )
}

function RelevanceMeter({ relevance }: { relevance: number }) {
  const pct = Math.round(relevance * 100)
  const color = pct >= 80 ? '#22c55e' : pct >= 55 ? '#f59e0b' : '#94a3b8'

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          relevance
        </span>
        <span className="font-mono text-xs font-semibold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          style={{
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            boxShadow: `0 0 6px ${color}50`,
          }}
        />
      </div>
    </motion.div>
  )
}

function HighlightChips({ highlights }: { highlights: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
      className="mt-2 flex flex-wrap gap-1.5"
    >
      {highlights.map((h, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 + i * 0.09 }}
          className="font-mono text-xs px-2 py-0.5 rounded"
          style={{
            background: 'rgba(245,158,11,0.07)',
            border: '1px solid rgba(245,158,11,0.18)',
            color: 'rgba(245,158,11,0.75)',
          }}
        >
          {h}
        </motion.span>
      ))}
    </motion.div>
  )
}

export default function ChatTerminal({ onNodesChange, onLatencyChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_INTRO])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentMeta, setCurrentMeta] = useState<Meta | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const startTimeRef = useRef<number>(0)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: content.trim() }
    const aiMsgId = `ai-${Date.now()}`
    const aiMsg: Message = { id: aiMsgId, role: 'assistant', content: '', streaming: true }

    setMessages(prev => [...prev, userMsg, aiMsg])
    setInput('')
    setIsStreaming(true)
    setCurrentMeta(null)
    setShowSuggestions(false)
    startTimeRef.current = Date.now()
    onNodesChange([])

    const history = [...messages, userMsg]
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          try {
            const data = JSON.parse(part.slice(6))

            if (data.type === 'text') {
              fullText += data.text
              const displayText = fullText.split('###META###')[0]
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: displayText } : m))
            } else if (data.type === 'done') {
              const [textPart, metaPart] = fullText.split('###META###')
              const cleanText = textPart.trim()

              if (metaPart) {
                try {
                  const meta: Meta = JSON.parse(metaPart.trim())
                  setCurrentMeta(meta)
                  onNodesChange(meta.nodes || [])
                } catch { /* meta parse failed */ }
              }

              setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, content: cleanText, streaming: false } : m)
              )
              onLatencyChange(Date.now() - startTimeRef.current)
              setIsStreaming(false)
            } else if (data.type === 'error') {
              setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, content: `Error: ${data.message}`, streaming: false } : m)
              )
              setIsStreaming(false)
            }
          } catch { /* skip malformed chunk */ }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId
            ? { ...m, content: 'Connection error — check that ANTHROPIC_API_KEY is set in .env.local', streaming: false }
            : m
        )
      )
      setIsStreaming(false)
    }
  }, [messages, isStreaming, onNodesChange, onLatencyChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 px-1 py-2"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg, idx) => {
          const isLast = idx === messages.length - 1
          const isLastAi = isLast && msg.role === 'assistant'

          if (msg.role === 'system') {
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm px-3 py-2.5 rounded-lg"
                style={{
                  background: 'rgba(6,182,212,0.04)',
                  border: '1px solid rgba(6,182,212,0.12)',
                  color: 'rgba(148,163,184,0.7)',
                }}
              >
                {msg.content}
              </motion.div>
            )
          }

          if (msg.role === 'user') {
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-end"
              >
                <div
                  className="max-w-[88%] px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(245,158,11,0.09)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    color: 'rgba(245,158,11,0.9)',
                  }}
                >
                  {msg.content}
                </div>
              </motion.div>
            )
          }

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="flex gap-2.5"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{
                    background: 'rgba(6,182,212,0.1)',
                    border: '1px solid rgba(6,182,212,0.25)',
                  }}
                >
                  <Sparkles size={10} style={{ color: '#06b6d4' }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs mb-1" style={{ color: 'rgba(6,182,212,0.45)' }}>
                  Tomer's AI
                </div>
                <div className="text-sm text-slate-300 leading-relaxed">
                  <StreamingText text={msg.content} streaming={!!msg.streaming} />
                </div>

                {isLastAi && !msg.streaming && currentMeta && (
                  <>
                    <RelevanceMeter relevance={currentMeta.relevance} />
                    {currentMeta.highlights?.length > 0 && (
                      <HighlightChips highlights={currentMeta.highlights} />
                    )}
                    {currentMeta.nodes?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="mt-2 flex flex-wrap gap-1"
                      >
                        {currentMeta.nodes.map(nodeId => {
                          const node = NODE_MAP[nodeId]
                          if (!node) return null
                          return (
                            <span
                              key={nodeId}
                              className="font-mono text-xs px-1.5 py-0.5 rounded"
                              style={{
                                background: `${node.color}0d`,
                                border: `1px solid ${node.color}22`,
                                color: `${node.color}70`,
                              }}
                            >
                              {node.icon} {node.company.split(' ')[0]}
                            </span>
                          )
                        })}
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )
        })}

        {/* Suggested questions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ delay: 0.25 }}
              className="pt-1"
            >
              <p className="font-mono text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                Try asking:
              </p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    onClick={() => sendMessage(q)}
                    disabled={isStreaming}
                    className="flex items-center gap-2 text-left px-3 py-2 rounded-lg text-xs transition-all duration-150"
                    style={{
                      background: 'rgba(148,163,184,0.03)',
                      border: '1px solid rgba(148,163,184,0.08)',
                      color: 'rgba(148,163,184,0.45)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(245,158,11,0.06)'
                      e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)'
                      e.currentTarget.style.color = 'rgba(245,158,11,0.75)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(148,163,184,0.03)'
                      e.currentTarget.style.borderColor = 'rgba(148,163,184,0.08)'
                      e.currentTarget.style.color = 'rgba(148,163,184,0.45)'
                    }}
                  >
                    <ChevronRight size={10} className="flex-shrink-0 opacity-50" />
                    <span>{q}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <AnimatePresence>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mb-2 px-1"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ background: '#06b6d4' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="font-mono text-xs" style={{ color: 'rgba(6,182,212,0.45)' }}>
                thinking...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 items-end">
          <div
            className="flex-1 relative rounded-lg overflow-hidden"
            style={{
              background: 'rgba(13,20,36,0.7)',
              border: '1px solid var(--border-bright)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Ask me anything about Tomer..."
              rows={1}
              className="w-full bg-transparent text-sm px-4 py-3 resize-none focus:outline-none placeholder:text-slate-700"
              style={{ color: 'var(--text-primary)', maxHeight: '100px' }}
              onInput={e => {
                const t = e.currentTarget
                t.style.height = 'auto'
                t.style.height = `${Math.min(t.scrollHeight, 100)}px`
              }}
            />
          </div>

          <button
            onClick={() => sendMessage(input)}
            disabled={isStreaming || !input.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{
              background: isStreaming || !input.trim() ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.14)',
              border: '1px solid rgba(245,158,11,0.18)',
              color: isStreaming || !input.trim() ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.9)',
            }}
          >
            {isStreaming
              ? <Zap size={14} style={{ animation: 'pulse 1s ease-in-out infinite' }} />
              : <Send size={14} />
            }
          </button>
        </div>

        <p className="font-mono text-xs mt-2 px-1" style={{ color: 'var(--text-muted)' }}>
          ↵ send · Shift+↵ newline
        </p>
      </div>
    </div>
  )
}
