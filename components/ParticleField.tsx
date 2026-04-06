'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; opacity: number; color: string; life: number; maxLife: number
}

interface Star {
  x: number; y: number; size: number
  baseOpacity: number; twinkleSpeed: number; twinkleOffset: number
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef<Particle[]>([])
  const starsRef = useRef<Star[]>([])
  const rafRef = useRef<number>(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const COLORS = [
      'rgba(245,158,11,',
      'rgba(6,182,212,',
      'rgba(139,92,246,',
      'rgba(148,163,184,',
    ]

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Re-scatter stars on resize
      starsRef.current = Array.from({ length: 220 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.3 + Math.random() * 0.9,
        baseOpacity: 0.08 + Math.random() * 0.28,
        twinkleSpeed: 0.004 + Math.random() * 0.012,
        twinkleOffset: Math.random() * Math.PI * 2,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const createParticle = (): Particle => {
      const maxLife = 120 + Math.random() * 180
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28 - 0.08,
        size: 0.5 + Math.random() * 1.4,
        opacity: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife,
      }
    }

    for (let i = 0; i < 70; i++) {
      const p = createParticle()
      p.life = Math.random() * p.maxLife
      particlesRef.current.push(p)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    const render = () => {
      frameRef.current++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ── Stars ──────────────────────────────────────────────
      starsRef.current.forEach(star => {
        const twinkle = Math.sin(frameRef.current * star.twinkleSpeed + star.twinkleOffset)
        const opacity = star.baseOpacity + twinkle * (star.baseOpacity * 0.5)
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,215,255,${Math.max(0, opacity)})`
        ctx.fill()
      })

      // ── Particles ──────────────────────────────────────────
      particlesRef.current.forEach((p, i) => {
        p.life++
        if (p.life >= p.maxLife) {
          particlesRef.current[i] = createParticle()
          return
        }

        const halfLife = p.maxLife / 2
        p.opacity = p.life < halfLife
          ? (p.life / halfLife) * 0.55
          : ((p.maxLife - p.life) / halfLife) * 0.55

        const dx = p.x - mouseRef.current.x
        const dy = p.y - mouseRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120 * 0.014
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy

        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas.height + 10
        if (p.y > canvas.height + 10) p.y = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.opacity.toFixed(2)})`
        ctx.fill()
      })

      // ── Connection lines ───────────────────────────────────
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i]
          const b = particlesRef.current[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 75) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(148,163,184,${(1 - dist / 75) * 0.035})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      rafRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
