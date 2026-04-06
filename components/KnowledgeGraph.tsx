'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CAREER_NODES, GRAPH_EDGES, NODE_MAP, type CareerNode } from '@/lib/resume-data'

interface Props {
  activeNodes: string[]
  onNodeClick: (id: string) => void
}

function getNodeRadius(node: CareerNode): number {
  return node.size === 'large' ? 7 : 4.5
}

function getCurvePoints(from: CareerNode, to: CareerNode) {
  const x1 = from.cx, y1 = from.cy
  const x2 = to.cx,   y2 = to.cy
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const cpx = mx + (y2 - y1) * 0.18
  const cpy = my - (x2 - x1) * 0.12
  return `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`
}

export default function KnowledgeGraph({ activeNodes, onNodeClick }: Props) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const handleNodeClick = (id: string) => {
    setSelectedNode(prev => prev === id ? null : id)
    onNodeClick(id)
  }

  const activeEdges = new Set<string>()
  GRAPH_EDGES.forEach(([from, to]) => {
    if (activeNodes.includes(from) || activeNodes.includes(to)) {
      activeEdges.add(`${from}-${to}`)
    }
  })

  const selected = selectedNode ? NODE_MAP[selectedNode] : null

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Graph SVG */}
      <div className="relative flex-1 min-h-0">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {CAREER_NODES.map(node => (
              <filter key={node.id} id={`glow-${node.id}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation={activeNodes.includes(node.id) ? '2' : '0.6'} result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            ))}
          </defs>

          {/* Edges */}
          {GRAPH_EDGES.map(([fromId, toId]) => {
            const from = NODE_MAP[fromId]
            const to = NODE_MAP[toId]
            if (!from || !to) return null
            const edgeKey = `${fromId}-${toId}`
            const isActive = activeEdges.has(edgeKey)
            const d = getCurvePoints(from, to)
            return (
              <g key={edgeKey}>
                <path
                  d={d}
                  fill="none"
                  stroke={isActive ? from.color : 'rgba(148,163,184,0.07)'}
                  strokeWidth={isActive ? '0.55' : '0.3'}
                  style={{ transition: 'stroke 0.5s ease, stroke-width 0.5s ease' }}
                />
                {isActive && (
                  <path
                    d={d}
                    fill="none"
                    stroke={from.color}
                    strokeWidth="0.4"
                    strokeDasharray="2 3"
                    style={{ opacity: 0.65, animation: 'edgeFlow 1.2s linear infinite' }}
                  />
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {CAREER_NODES.map(node => {
            const isActive = activeNodes.includes(node.id)
            const isHovered = hoveredNode === node.id
            const r = getNodeRadius(node)
            const scale = isActive ? 1.2 : isHovered ? 1.08 : 1

            return (
              <g
                key={node.id}
                transform={`translate(${node.cx}, ${node.cy})`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer pulse ring */}
                {isActive && (
                  <motion.circle
                    r={r * 1.9}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="0.3"
                    animate={{ r: [r * 1.9, r * 2.6, r * 1.9], opacity: [0.25, 0.08, 0.25] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                {/* Inner glow ring */}
                {isActive && (
                  <motion.circle
                    r={r * 1.4}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="0.5"
                    animate={{ r: [r * 1.4, r * 1.6, r * 1.4], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                  />
                )}

                {/* Main circle */}
                <motion.circle
                  r={r}
                  fill={isActive ? node.color : isHovered ? `${node.color}22` : 'rgba(10,15,30,0.92)'}
                  stroke={node.color}
                  strokeWidth={isActive ? (node.size === 'large' ? '1.2' : '0.9') : (node.size === 'large' ? '0.8' : '0.5')}
                  animate={{ scale }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  style={{
                    filter: isActive
                      ? `drop-shadow(0 0 ${node.size === 'large' ? '5px' : '3px'} ${node.color}) drop-shadow(0 0 ${node.size === 'large' ? '10px' : '6px'} ${node.color})`
                      : isHovered
                        ? `drop-shadow(0 0 2px ${node.color})`
                        : 'none',
                  }}
                />

                {/* Icon */}
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={node.size === 'large' ? '4.5' : '3'}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {node.icon}
                </text>

                {/* Company label */}
                <text
                  y={r + 2.8}
                  textAnchor="middle"
                  fontSize={node.size === 'large' ? '2.4' : '1.9'}
                  fill={isActive ? node.color : 'rgba(148,163,184,0.55)'}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight={isActive || node.size === 'large' ? '600' : '400'}
                  style={{
                    textShadow: isActive ? `0 0 4px ${node.color}` : 'none',
                    transition: 'fill 0.3s ease',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  {node.company.split(' ')[0]}
                </text>

                {/* Period */}
                <text
                  y={r + (node.size === 'large' ? 5.2 : 4.8)}
                  textAnchor="middle"
                  fontSize="1.55"
                  fill="rgba(71,85,105,0.7)"
                  fontFamily="'JetBrains Mono', monospace"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {node.period}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected Node Detail Card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="glass rounded-lg p-3 overflow-hidden flex-shrink-0"
            style={{ borderColor: selected.borderColor }}
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">{selected.icon}</span>
              <div className="flex-1 min-w-0">
                <div
                  className="font-mono text-xs font-semibold truncate"
                  style={{ color: selected.color, textShadow: `0 0 6px ${selected.color}` }}
                >
                  {selected.company}
                </div>
                <div className="text-xs text-slate-400 truncate">{selected.title}</div>
                <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {selected.period} · {selected.location}
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-600 hover:text-slate-400 text-xs flex-shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            {selected.metric && (
              <div
                className="font-mono text-xs mb-2 px-2 py-1 rounded"
                style={{
                  background: `${selected.color}12`,
                  color: selected.color,
                  border: `1px solid ${selected.color}28`,
                }}
              >
                ★ {selected.metric}
              </div>
            )}

            <ul className="space-y-1 mb-2">
              {selected.bullets.map((b, i) => (
                <li key={i} className="text-xs text-slate-400 flex gap-1.5">
                  <span style={{ color: selected.color, flexShrink: 0 }}>›</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1">
              {selected.skills.map(s => (
                <span
                  key={s}
                  className="font-mono text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: `${selected.color}0e`,
                    color: `${selected.color}88`,
                    border: `1px solid ${selected.color}1a`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
