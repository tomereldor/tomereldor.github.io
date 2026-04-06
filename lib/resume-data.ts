export interface CareerNode {
  id: string
  title: string
  company: string
  period: string
  location: string
  color: string
  glowColor: string
  borderColor: string
  icon: string
  bullets: string[]
  skills: string[]
  metric?: string
  size?: 'large' | 'normal'
  cx: number // SVG viewBox coordinate (0-100)
  cy: number
  connections: string[]
}

// Layout: newer at top (small cy), older at bottom (large cy)
// Palantir is the central hub — largest node
export const CAREER_NODES: CareerNode[] = [
  // ── Row 1: Current / newest ──────────────────────────────
  {
    id: 'sybil_fde',
    title: 'Senior Lead FDE',
    company: 'Sybil AI',
    period: '2024 – Present',
    location: 'Europe',
    color: '#38bdf8',
    glowColor: 'rgba(56,189,248,0.35)',
    borderColor: 'rgba(56,189,248,0.6)',
    icon: '🤖',
    metric: 'Claude Code · LLMs · Europe\'s largest enterprises',
    bullets: [
      'Senior Lead Field Deployment Engineer deploying AI-native enterprise solutions',
      'Working with Claude Code, LLMs and AI-native systems across Europe\'s largest enterprises',
      'Bridging frontier AI capabilities with complex enterprise environments',
    ],
    skills: ['Claude Code', 'LLM Deployment', 'Enterprise AI', 'Field Engineering'],
    cx: 28, cy: 7,
    connections: ['palantir', 'wiliot'],
  },
  {
    id: 'wiliot',
    title: 'Lead Data Science & ML Solution Architect',
    company: 'Wiliot Ltd',
    period: '2023 – Present',
    location: 'London, UK',
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.4)',
    borderColor: 'rgba(245,158,11,0.7)',
    icon: '🌟',
    metric: '50% → 99% ML accuracy · $100M+ deal',
    bullets: [
      'Primary technical architect for Top 10 S&P 500 flagship project — $100M+ strategic roadmap',
      'Optimized ML accuracy from 50% → >99% via production ML pipelines on GCP with CI/CD',
      'Designed internal data warehouses and API architecture for scalability',
      'Implemented batch & streaming data flows for next-gen IoT hardware',
    ],
    skills: ['ML Architecture', 'GCP', 'CI/CD', 'Signal Processing', 'IoT', 'Data Lakehouse'],
    cx: 72, cy: 7,
    connections: ['palantir'],
  },

  // ── Palantir: central hub ─────────────────────────────────
  {
    id: 'palantir',
    title: 'Lead Data & Applied AI Consultant',
    company: 'Palantir Technologies',
    period: '2019 – 2023',
    location: 'London, UK',
    color: '#f97316',
    glowColor: 'rgba(249,115,22,0.45)',
    borderColor: 'rgba(249,115,22,0.75)',
    icon: '🔮',
    metric: 'CEO: "most promising project"',
    size: 'large',
    bullets: [
      'Built "Agora" — CEO recognised as Palantir\'s "most promising project", scaled to hundreds of clients',
      'Directed technical architecture for Fortune 500 clients across complex GCP cloud ecosystems',
      'Patent-pending data tools for medical research and national healthcare systems',
      'Managed teams of 16 engineers through full agile lifecycle to production',
    ],
    skills: ['Solution Architecture', 'Enterprise AI', 'GCP', 'Palantir AIP', 'Program Management'],
    cx: 50, cy: 24,
    connections: ['impact_colabs'],
  },

  // ── Row 3: Data Science / Tech ───────────────────────────
  {
    id: 'via',
    title: 'Data Scientist & ML Engineer',
    company: 'Via Transportation 🚗',
    period: '2017 – 2018',
    location: 'New York, NY',
    color: '#ec4899',
    glowColor: 'rgba(236,72,153,0.35)',
    borderColor: 'rgba(236,72,153,0.6)',
    icon: '🚗',
    metric: '+10% profit · $10K/week saved',
    bullets: [
      'Increased profits by 10% via interpretable ML behaviour models',
      'Saved $10K/week through engagement prediction and incentive optimisation',
      'Ran large-scale A/B experiments across thousands of users',
      'Boosted reporting efficiency by 70% with automated production pipelines',
    ],
    skills: ['ML Engineering', 'A/B Testing', 'Python', 'MLOps', 'Pipelines'],
    cx: 28, cy: 41,
    connections: ['palantir'],
  },
  {
    id: 'idf_8200',
    title: 'Cyber Project Manager & Engineer',
    company: 'IDF 8200 — Intelligence',
    period: '2010 – 2013',
    location: 'Israel',
    color: '#22c55e',
    glowColor: 'rgba(34,197,94,0.35)',
    borderColor: 'rgba(34,197,94,0.6)',
    icon: '⚡',
    metric: '20+ intelligence solutions',
    bullets: [
      'Spearheaded cyber operations for a 600-member elite intelligence unit',
      'Delivered 20+ custom intelligence solutions through cross-functional collaboration',
      'Deep technical and operational leadership from age 19',
    ],
    skills: ['Cyber Ops', 'Intelligence', 'Engineering', 'Leadership'],
    cx: 72, cy: 41,
    connections: ['lumos', 'minerva_edu'],
  },

  // ── Row 4: Impact / Education ─────────────────────────────
  {
    id: 'impact_colabs',
    title: 'Founder',
    company: 'Impact CoLabs — Nonprofit',
    period: '2021 – 2023',
    location: 'Remote',
    color: '#10b981',
    glowColor: 'rgba(16,185,129,0.35)',
    borderColor: 'rgba(16,185,129,0.6)',
    icon: '🌍',
    metric: '100+ professionals matched',
    bullets: [
      'Founded nonprofit matching 100+ tech professionals to high-impact altruism projects',
      'Automated operations end-to-end for scalability',
    ],
    skills: ['Leadership', 'Social Impact', 'Automation', 'Community'],
    cx: 28, cy: 58,
    connections: ['music'],
  },
  {
    id: 'minerva_edu',
    title: 'BSc Computational Sciences & Economics',
    company: 'Minerva University',
    period: '2015 – 2019',
    location: 'Global — 7 cities',
    color: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.35)',
    borderColor: 'rgba(139,92,246,0.6)',
    icon: '🎓',
    metric: 'GPA 3.93 / 4.0 · Summa Cum Laude',
    bullets: [
      '1% acceptance rate — one of the most selective programmes in the world',
      'Double BSc: Data Science & AI + Economics and Society',
      'Graduated Summa Cum Laude, GPA 3.93/4.0',
      'Studied across 7 global cities: SF, Seoul, Berlin, Buenos Aires, Hyderabad, London, Taipei',
    ],
    skills: ['Machine Learning', 'AI', 'Statistics', 'Economics', 'Research'],
    cx: 72, cy: 58,
    connections: ['via', 'minerva_pm'],
  },

  // ── Row 5: Earlier career ─────────────────────────────────
  {
    id: 'minerva_pm',
    title: 'Product Manager',
    company: 'Minerva Project',
    period: '2016 – 2017',
    location: 'San Francisco, CA',
    color: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.35)',
    borderColor: 'rgba(6,182,212,0.6)',
    icon: '🚀',
    metric: '+50% NPS increase',
    bullets: [
      'Led 30+ product initiatives end-to-end',
      'Increased NPS and user satisfaction by 50%',
      'Leveraged user feedback loops to ship cost-effective high-impact solutions',
    ],
    skills: ['Product Management', 'UX Research', 'Agile', 'Strategy'],
    cx: 28, cy: 75,
    connections: [],
  },
  {
    id: 'lumos',
    title: 'Product QA Engineering Lead',
    company: 'Lumos Global',
    period: '2013 – 2014',
    location: 'Israel',
    color: '#a78bfa',
    glowColor: 'rgba(167,139,250,0.35)',
    borderColor: 'rgba(167,139,250,0.6)',
    icon: '💡',
    metric: '400+ tests built',
    bullets: [
      'Founded and scaled the QA department from zero',
      'Enabled prototype deployment to 500+ hardware units',
      'Developed 400+ tests across software, hardware, and communication protocols',
    ],
    skills: ['QA Engineering', 'Hardware Testing', 'Team Building'],
    cx: 72, cy: 75,
    connections: ['minerva_pm'],
  },

  // ── Row 6: Music / Creative ───────────────────────────────
  {
    id: 'music',
    title: 'Musical Director & Jazz Musician',
    company: 'Independent · 20 Lambs Ensemble',
    period: '2015 – Present',
    location: 'London, UK · International',
    color: '#e879f9',
    glowColor: 'rgba(232,121,249,0.35)',
    borderColor: 'rgba(232,121,249,0.6)',
    icon: '🎵',
    metric: 'International festivals · Top UK Jazz venues',
    bullets: [
      'Musical Director of the 20 Lambs Ensemble — leading orchestras and music projects with up to 40 musicians',
      'Runs a peacebuilding through music collective, performing at international festivals and top UK Jazz venues',
      'Fundraised thousands of $ for humanitarian aid projects through music',
      'Breaking boundaries between music genres, art forms, and between audience and performer',
      'Composer, arranger, producer, pianist and vocalist across experimental jazz and cross-genre projects',
    ],
    skills: ['Musical Direction', 'Jazz', 'Composition', 'Peacebuilding', 'Arts Leadership'],
    cx: 50, cy: 90,
    connections: [],
  },
]

export const NODE_MAP = Object.fromEntries(CAREER_NODES.map(n => [n.id, n]))

export const GRAPH_EDGES: [string, string][] = CAREER_NODES.flatMap(node =>
  node.connections.map(target => [node.id, target] as [string, string])
)
