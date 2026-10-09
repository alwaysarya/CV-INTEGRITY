import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Book, MessageCircle, Keyboard, FileText, Search,
  ChevronRight, Mail, BookOpen, LifeBuoy, Video
} from 'lucide-react'

const sections = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    color: '#10B981',
    articles: [
      { title: 'System Overview', desc: 'Understanding CV-INTEGRITY architecture' },
      { title: 'Dashboard Tour', desc: 'Navigate the Vision Assurance Center' },
      { title: 'First Time Setup', desc: 'Configure your workspace' },
    ],
  },
  {
    title: 'Core Concepts',
    icon: Book,
    color: '#3B82F6',
    articles: [
      { title: 'Integrity Chain', desc: 'Data to Model to Inference to Output' },
      { title: 'Trust Scores', desc: 'How entity trust is calculated' },
      { title: 'Threat Detection', desc: 'Attack patterns and detection methods' },
    ],
  },
  {
    title: 'Features',
    icon: FileText,
    color: '#8B5CF6',
    articles: [
      { title: 'Live Vision Analysis', desc: 'Real-time frame inspection' },
      { title: 'Reports and Evidence', desc: 'Export and compliance documentation' },
      { title: 'Blockchain Ledger', desc: 'Tamper-evident audit trail' },
    ],
  },
]

const shortcuts = [
  { keys: ['Cmd', 'K'], label: 'Open command palette' },
  { keys: ['Cmd', 'R'], label: 'Refresh current page' },
  { keys: ['Cmd', 'B'], label: 'Toggle sidebar' },
  { keys: ['Esc'], label: 'Close modal / dialog' },
  { keys: ['G', 'D'], label: 'Go to Dashboard' },
  { keys: ['G', 'T'], label: 'Go to Threats' },
]

export function Help() {
  const [search, setSearch] = useState('')

  const filtered = sections.map(s => ({
    ...s,
    articles: s.articles.filter(a =>
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(s => s.articles.length > 0)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Help
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Help and Documentation
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Guides, concepts, keyboard shortcuts and support resources.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-emerald-700">Support online</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: 'Documentation', desc: 'Full API reference', icon: Book, color: '#3B82F6' },
            { label: 'Video Tutorials', desc: 'Watch feature walkthroughs', icon: Video, color: '#8B5CF6' },
            { label: 'Contact Support', desc: 'Talk to our team', icon: MessageCircle, color: '#10B981' },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ y: -2 }}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${item.color}15` }}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-slate-900">{item.label}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{item.desc}</div>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </motion.button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {filtered.map((section) => (
            <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${section.color}15` }}>
                  <section.icon size={14} style={{ color: section.color }} />
                </div>
                <div className="text-[14px] font-semibold text-slate-900">{section.title}</div>
              </div>

              <div className="space-y-2">
                {section.articles.map((a) => (
                  <button
                    key={a.title}
                    className="group flex w-full items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
                  >
                    <div className="flex-1">
                      <div className="text-[12px] font-medium text-slate-800 group-hover:text-emerald-900">{a.title}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{a.desc}</div>
                    </div>
                    <ChevronRight size={13} className="mt-1 text-slate-300 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <Keyboard size={14} className="text-amber-600" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-slate-900">Keyboard Shortcuts</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Speed up your workflow</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {shortcuts.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
              >
                <span className="text-[12px] text-slate-700">{s.label}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k, i) => (
                    <kbd
                      key={i}
                      className="flex h-6 min-w-[24px] items-center justify-center rounded-md border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-semibold text-slate-700 shadow-sm"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[15px] font-semibold text-slate-900">Still need help?</div>
              <div className="mt-1 text-[12px] text-slate-600">
                Our team typically responds within 2 hours during business days.
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-50">
                <Mail size={13} />
                Email Support
              </button>
              <button className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-emerald-700">
                <LifeBuoy size={13} />
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
