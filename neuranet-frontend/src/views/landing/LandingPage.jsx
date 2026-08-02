import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  PlayCircle,
  ShieldCheck,
  Radar,
  Activity,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Server,
  Cpu,
  Database,
  Code2,
  Monitor,
  BellRing,
  Brain,
  FileText,
  GitBranch,
  Mail,
  Globe2,
  Shield,
  Gauge,
  ScanLine,
  PanelTop,
  NotebookTabs,
  Layers,
  Zap,
  Laptop2,
} from 'lucide-react'

import './landing.css'

/**
 * Static network topology graphic for the hero.
 * Previously used SMIL <animateMotion>/<animate> to continuously animate
 * traveling packets and pulsing rings. That runs the browser's animation
 * engine indefinitely for as long as the tab is open, purely for décor.
 * Rendered as a static illustration instead — same visual composition,
 * zero ongoing paint/animation cost.
 */
function HeroIllustration() {
  const nodes = [
    { x: 40, y: 260 },
    { x: 140, y: 90 },
    { x: 260, y: 170 },
    { x: 380, y: 70 },
    { x: 430, y: 230 },
    { x: 300, y: 300 },
    { x: 120, y: 330 },
  ]
  const links = [
    [0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 0], [2, 6],
  ]
  const threatNodeIndex = 4

  return (
    <svg viewBox="0 0 470 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Network topology with AI-assisted threat detection">
      <defs>
        <radialGradient id="nn-shield-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--nn-signal-500)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--nn-signal-500)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {links.map(([a, b], i) => {
        const n1 = nodes[a]
        const n2 = nodes[b]
        return (
          <line
            key={`link-${i}`}
            x1={n1.x}
            y1={n1.y}
            x2={n2.x}
            y2={n2.y}
            stroke="rgba(148,163,184,0.16)"
            strokeWidth="1.2"
          />
        )
      })}

      <circle cx="235" cy="190" r="90" fill="url(#nn-shield-glow)" />
      <circle cx="235" cy="190" r="46" fill="var(--nn-bg-1)" stroke="var(--nn-signal-500)" strokeWidth="1.5" opacity="0.9" />

      {nodes.map((n, i) => {
        const isThreat = i === threatNodeIndex
        const color = isThreat ? 'var(--nn-sev-high)' : 'var(--nn-signal-500)'
        return (
          <g key={`node-${i}`}>
            {isThreat && (
              <circle cx={n.x} cy={n.y} r="12" fill="none" stroke={color} strokeWidth="1.5" opacity="0.45" />
            )}
            <circle cx={n.x} cy={n.y} r="6" fill="var(--nn-bg-1)" stroke={color} strokeWidth="1.8" />
            <circle cx={n.x} cy={n.y} r="2.4" fill={color} />
          </g>
        )
      })}
    </svg>
  )
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="nn-section-head">
      <div className="nn-pill">
        <span className="nn-dot nn-dot-info" />
        {eyebrow}
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="nn-hero nn-container" id="home">
      <div>
        <div className="nn-hero-eyebrow nn-pill">
          <span className="nn-dot nn-dot-info" />
          Enterprise Network Intelligence Platform
        </div>

        <h1>
          Secure the modern enterprise with{' '}
          <span className="nn-gradient-text">NeuraNet</span>
        </h1>

        <p className="nn-hero-sub">
          Bring operational clarity to network defense with a premium platform for monitoring,
          analysis, and real-time decision support across distributed environments.
        </p>

        <div className="nn-hero-cta">
          <Link to="/register" className="nn-btn nn-btn-primary">
            Get Started <ArrowRight size={18} />
          </Link>
          <Link to="/dashboard" className="nn-btn nn-btn-secondary">
            <PlayCircle size={18} /> View Dashboard
          </Link>
        </div>

        <div className="nn-hero-trustrow">
          <span className="nn-hero-trustchip"><ShieldCheck size={13} /> Unified Visibility</span>
          <span className="nn-hero-trustchip"><Radar size={13} /> Live Monitoring</span>
          <span className="nn-hero-trustchip"><Activity size={13} /> Rapid Response</span>
        </div>
      </div>

      <div className="nn-hero-stage">
        <HeroIllustration />

        <div className="nn-float-card" style={{ top: '8%', left: '6%' }}>
          <span className="nn-dot nn-dot-high" />
          Threat activity &nbsp;<b>Escalated</b>
        </div>
        <div className="nn-float-card" style={{ bottom: '10%', right: '6%' }}>
          Protection state &nbsp;<b>Stable</b>
        </div>
        <div className="nn-float-card" style={{ top: '44%', right: '4%' }}>
          <span className="nn-dot nn-dot-low" />
          Network flow &nbsp;<b>Live</b>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const quickAccessItems = [
    { title: 'Dashboard', description: 'Jump into the live console.', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Documentation', description: 'Start with the product resources.', href: '#documentation', icon: BookOpen },
    { title: 'GitHub Repository', description: 'Explore the open source codebase.', href: 'https://github.com/', icon: GitBranch },
    { title: 'API Documentation', description: 'Review the operational interface.', href: '#documentation', icon: ScanLine },
  ]

  const architectureSteps = [
    'Network Traffic',
    'Packet Capture',
    'AI Analysis',
    'Threat Detection',
    'Dashboard',
  ]

  const stackItems = [
    { title: 'React', icon: Layers },
    { title: 'CoreUI', icon: PanelTop },
    { title: 'FastAPI', icon: Zap },
    { title: 'Python', icon: Cpu },
    { title: 'TensorFlow', icon: Brain },
    { title: 'PostgreSQL', icon: Database },
    { title: 'Scapy', icon: Shield },
  ]

  const showcaseItems = [
    { title: 'Dashboard', description: 'Executive view of live security posture.', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Devices', description: 'Inventory and health monitoring at a glance.', href: '/devices', icon: Server },
    { title: 'Alerts', description: 'Prioritized incident and response workflow.', href: '/alerts', icon: BellRing },
    { title: 'AI Analysis', description: 'Context-rich operational investigations.', href: '/analysis', icon: Brain },
    { title: 'Analytics', description: 'Signal trends and adoption reporting.', href: '/analytics', icon: Gauge },
    { title: 'Settings', description: 'Tune integrations and environment controls.', href: '/settings', icon: Monitor },
  ]

  const documentationItems = [
    { title: 'User Guide', description: 'A concise onboarding experience for teams.', href: '#documentation', icon: NotebookTabs },
    { title: 'Developer Guide', description: 'Build extensions and integrations with confidence.', href: '#documentation', icon: Code2 },
    { title: 'API Documentation', description: 'Explore the available operational endpoints.', href: '#documentation', icon: ScanLine },
  ]

  return (
    <div className="nn-landing" id="home">
      <nav className="nn-nav nn-container">
        <div className="nn-nav-shell">
          <a className="nn-brand" href="#home">
            <span className="nn-brand-mark" />
            <span>NeuraNet</span>
          </a>

          <div className="nn-nav-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#documentation">Documentation</a>
            <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="nn-nav-cta">
            <Link to="/dashboard" className="nn-btn nn-btn-secondary nn-btn-small">
              View Dashboard
            </Link>
            <Link to="/register" className="nn-btn nn-btn-primary nn-btn-small">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <HeroSection />

      <section className="nn-section nn-container" id="features">
        <SectionHeading
          eyebrow="Quick Access"
          title="Move from idea to operational clarity in a few clicks"
          description="A polished launchpad for the core product surfaces, from the live console to developer resources."
        />

        <div className="nn-grid nn-grid-3">
          {quickAccessItems.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.title}
                href={item.href}
                className="nn-panel nn-access-card"
              >
                <div className="nn-icon-badge">
                  <Icon size={18} />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <span className="nn-card-link">
                  Open <ChevronRight size={16} />
                </span>
              </a>
            )
          })}
        </div>
      </section>

      <section className="nn-section nn-container" id="architecture">
        <SectionHeading
          eyebrow="Architecture"
          title="A streamlined workflow designed for modern security teams"
          description="The experience stays visual and approachable while presenting the platform's core lifecycle clearly."
        />

        <div className="nn-panel nn-architecture-panel">
          <div className="nn-architecture-flow">
            {architectureSteps.map((step, index) => (
              <div key={step} className="nn-flow-step">
                <div className="nn-flow-dot" />
                <div className="nn-flow-card">
                  <span className="nn-flow-index">0{index + 1}</span>
                  <strong>{step}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="nn-architecture-copy">
            <div className="nn-pill">
              <span className="nn-dot nn-dot-info" />
              Operational path
            </div>
            <h3>From traffic intake to actionable visibility</h3>
            <p>
              The platform presents a refined path from network telemetry to operational response,
              helping teams understand each stage without exposing internal implementation details.
            </p>
            <div className="nn-feature-list">
              <span><Sparkles size={14} /> Designed for clarity</span>
              <span><Shield size={14} /> Enterprise-grade presentation</span>
              <span><Activity size={14} /> Near real-time responsiveness</span>
            </div>
          </div>
        </div>
      </section>

      <section className="nn-section nn-container">
        <SectionHeading
          eyebrow="Technology Stack"
          title="Built with dependable technologies for enterprise-grade delivery"
          description="A modern stack that supports robust development, deployment, and operational oversight."
        />

        <div className="nn-grid nn-grid-3">
          {stackItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="nn-panel nn-tech-card">
                <div className="nn-icon-badge">
                  <Icon size={18} />
                </div>
                <h3>{item.title}</h3>
              </div>
            )
          })}
        </div>
      </section>

      <section className="nn-section nn-container" id="dashboard">
        <SectionHeading
          eyebrow="Dashboard Showcase"
          title="A polished experience for monitoring and management"
          description="The interface is designed to feel premium, intuitive, and ready for operational use."
        />

        <div className="nn-grid nn-grid-3">
          {showcaseItems.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="nn-panel nn-preview-card">
                <div className="nn-preview-visual">
                  <div className="nn-preview-bar wide" />
                  <div className="nn-preview-bar" />
                  <div className="nn-preview-bar" />
                  <div className="nn-preview-grid" />
                </div>
                <div className="nn-preview-content">
                  <div className="nn-icon-badge">
                    <Icon size={16} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a href={item.href} className="nn-btn nn-btn-secondary nn-btn-small">
                    Open Page <ArrowRight size={16} />
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="nn-section nn-container" id="documentation">
        <SectionHeading
          eyebrow="Documentation Center"
          title="Support every stage of adoption and rollout"
          description="Clear materials for operators, administrators, developers, and stakeholders alike."
        />

        <div className="nn-grid nn-grid-3">
          {documentationItems.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="nn-panel nn-doc-card">
                <div className="nn-icon-badge">
                  <Icon size={18} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a href={item.href} className="nn-btn nn-btn-secondary nn-btn-small">
                  Open <ArrowRight size={16} />
                </a>
              </article>
            )
          })}
        </div>
      </section>

      <section className="nn-section nn-container" id="github">
        <SectionHeading
          eyebrow="Open Source"
          title="A transparent, developer-friendly platform"
          description="Built to be explored, extended, and adopted by modern engineering teams."
        />

        <div className="nn-panel nn-code-panel">
          <div className="nn-code-window">
            <div className="nn-code-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="nn-code-lines">
              <div>git clone https://github.com/</div>
              <div>npm install</div>
              <div>npm run dev</div>
            </div>
          </div>
          <p>
            Explore the full source, review how the platform is put together, and see the project
            evolve. Contributions, issues, and feedback are welcome.
          </p>
          <div className="nn-hero-cta">
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="nn-btn nn-btn-primary nn-btn-small">
              <GitBranch size={16} /> GitHub Repository
            </a>
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="nn-btn nn-btn-secondary nn-btn-small">
              <FileText size={16} /> View Source
            </a>
          </div>
        </div>
      </section>

      <section className="nn-section nn-container" id="about">
        <div className="nn-about-layout">
          <div className="nn-panel nn-about-copy">
            <div className="nn-pill">
              <span className="nn-dot nn-dot-info" />
              About NeuraNet
            </div>
            <h2>Creating a more confident security operating experience</h2>
            <p>
              NeuraNet is designed as a modern enterprise platform that helps organizations keep pace
              with the complexity of digital environments. By combining clarity, responsiveness, and
              elegant workflow design, it turns network visibility into a strategic advantage.
            </p>
            <p>
              The experience is shaped for teams that need a professional, trustworthy, and future-ready
              surface for monitoring, operations, and decision support.
            </p>
          </div>

          <div className="nn-panel nn-dev-card">
            <div className="nn-dev-avatar">
              <Laptop2 size={24} />
            </div>
            <h3>Developer</h3>
            <div className="nn-dev-list">
              <span><strong>Name:</strong> Placeholder</span>
              <span><strong>GitHub:</strong> github.com/placeholder</span>
              <span><strong>LinkedIn:</strong> linkedin.com/in/placeholder</span>
              <span><strong>Email:</strong> hello@neurannett.dev</span>
            </div>
            <a href="#contact" className="nn-btn nn-btn-primary nn-btn-small">
              Contact <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="nn-section nn-container" id="contact">
        <div className="nn-panel nn-contact-panel">
          <div className="nn-contact-copy">
            <div className="nn-pill">
              <span className="nn-dot nn-dot-info" />
              Contact
            </div>
            <h2>Let's talk about the next stage of your security platform</h2>
            <p>
              Whether you are exploring the experience, planning a rollout, or looking to contribute,
              we would love to connect.
            </p>
          </div>
          <div className="nn-contact-actions">
            <a href="mailto:hello@neurannett.dev" className="nn-contact-link">
              <Mail size={16} /> hello@neurannett.dev
            </a>
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="nn-contact-link">
              <GitBranch size={16} /> GitHub
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noreferrer" className="nn-contact-link">
              <Globe2 size={16} /> LinkedIn
            </a>
          </div>
        </div>
      </section>

      <footer className="nn-footer">
        <div className="nn-container nn-footer-shell">
          <div>
            <a className="nn-brand" href="#home">
              <span className="nn-brand-mark" />
              <span>NeuraNet</span>
            </a>
            <p>Premium enterprise cybersecurity platform experience.</p>
          </div>

          <div className="nn-footer-grid">
            <div>
              <h4>Quick Links</h4>
              <a href="#features">Features</a>
              <a href="#architecture">Architecture</a>
              <a href="/dashboard">Dashboard</a>
            </div>
            <div>
              <h4>Resources</h4>
              <a href="#documentation">Documentation</a>
              <a href="https://github.com/">GitHub</a>
              <a href="#about">About</a>
            </div>
            <div>
              <h4>Documentation</h4>
              <a href="#documentation">User Guide</a>
              <a href="#documentation">Developer Guide</a>
              <a href="#documentation">API Documentation</a>
            </div>
            <div>
              <h4>Contact</h4>
              <a href="mailto:hello@neurannett.dev">Email</a>
              <a href="#contact">Contact</a>
              <a href="#contact">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
