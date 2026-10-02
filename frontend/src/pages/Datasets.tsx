import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database, Search, Upload, Eye, Loader2, AlertCircle, RefreshCw,
  CheckCircle2, TrendingUp, Radio, Hash, Lock, X, AlertTriangle, FileCheck,
  ShieldCheck, Scan
} from 'lucide-react'
import apiClient from '@/lib/api'

interface Dataset {
  name: string
  overall_score: number
  blur_score: number
  duplicate_score: number
  noise_score: number
  total_images: number
  category: string
}

export function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [flowStage, setFlowStage] = useState<'idle' | 'upload' | 'hash' | 'analyze' | 'score' | 'record' | 'verdict'>('idle')
  const [flowData, setFlowData] = useState<any>(null)
  const [flowFile, setFlowFile] = useState<File | null>(null)

  useEffect(() => { loadDatasets() }, [])

  const loadDatasets = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getDatasets()
      const data = res.data
      let datasetsList: Dataset[] = []
      if (data.datasets && typeof data.datasets === 'object') {
        datasetsList = Object.values(data.datasets)
      }
      setDatasets(datasetsList)
    } catch (err: any) {
      setError(err.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const filtered = datasets.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))

  const stats = {
    total: datasets.length,
    avgScore: datasets.length ? Math.round(datasets.reduce((s, d) => s + d.overall_score, 0) / datasets.length) : 0,
    good: datasets.filter((d) => d.category === 'GOOD').length,
    totalImages: datasets.reduce((s, d) => s + d.total_images, 0),
  }

  const runFlow = async (file: File) => {
    setFlowFile(file)
    setFlowStage('upload')
    await new Promise(r => setTimeout(r, 600))
    setFlowStage('hash')
    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    const fakeBlock = Math.floor(Math.random() * 50) + 10
    await new Promise(r => setTimeout(r, 800))
    setFlowStage('analyze')
    await new Promise(r => setTimeout(r, 1200))
    setFlowStage('score')
    const overall = Math.round(30 + Math.random() * 60)
    const grade = overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : overall >= 40 ? 'D' : 'F'
    const verdict = overall >= 80 ? 'accept' : overall >= 50 ? 'review' : 'quarantine'
    setFlowData({
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      hash: fakeHash,
      block: fakeBlock,
      overall,
      grade,
      verdict,
    })
    await new Promise(r => setTimeout(r, 800))
    setFlowStage('record')
    await new Promise(r => setTimeout(r, 800))
    setFlowStage('verdict')
  }

  const resetFlow = () => { setFlowStage('idle'); setFlowData(null); setFlowFile(null) }
  const closeModal = () => { setShowModal(false); resetFlow() }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#5EEAD4'
    if (score >= 80) return '#FBBF24'
    return '#F87171'
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <Database size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>DATASETS</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>DATASET_REGISTRY · INTEGRITY_VIEW</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5EEAD4', opacity: 0.5 }} />
            <input
              placeholder="Search datasets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded text-[11px] font-mono outline-none w-52"
              style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)', color: '#FFFFFF' }}
            />
          </div>
          <button onClick={loadDatasets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            REFRESH
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded flex items-center gap-2"
          style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          <AlertCircle size={14} style={{ color: '#F87171' }} />
          <span className="text-[11px] font-mono" style={{ color: '#F87171' }}>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_DATASETS', value: stats.total, color: '#3A7D8F' },
          { label: 'AVG_SCORE', value: `${stats.avgScore}%`, color: '#5EEAD4' },
          { label: 'GOOD_CATEGORY', value: stats.good, color: '#A78BFA' },
          { label: 'TOTAL_IMAGES', value: stats.totalImages, color: '#FBBF24' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] font-mono tracking-[0.2em] mb-2" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
            <div className="text-[28px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="p-5 rounded" style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
            <span className="ml-3 text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>LOADING DATASETS...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
                  {['DATASET', 'SCORE', 'BLUR', 'DUPLICATE', 'NOISE', 'IMAGES', 'STATUS'].map((h, i) => (
                    <th key={h}
                      className={`text-[10px] font-mono tracking-[0.15em] uppercase pb-3 ${i < 2 || i === 5 ? (i === 0 ? 'text-left' : i === 5 ? 'text-right' : 'text-right') : 'text-right'}`}
                      style={{ color: '#5EEAD4', opacity: 0.5 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ds, i) => {
                  const scoreColor = getScoreColor(ds.overall_score)
                  const catColor = ds.category === 'GOOD' ? '#5EEAD4' : '#FBBF24'
                  return (
                    <motion.tr key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.06)' }}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded flex items-center justify-center"
                            style={{ background: `${scoreColor}15`, border: `1px solid ${scoreColor}40` }}>
                            <Database size={16} style={{ color: scoreColor }} />
                          </div>
                          <div>
                            <div className="text-[13px] font-bold font-mono capitalize" style={{ color: '#FFFFFF' }}>{ds.name}</div>
                            <div className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.4 }}>
                              {ds.total_images} images
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[12px] font-bold font-mono" style={{ color: scoreColor }}>
                          {ds.overall_score.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.7 }}>{ds.blur_score.toFixed(1)}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.7 }}>{ds.duplicate_score.toFixed(1)}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.7 }}>{ds.noise_score.toFixed(1)}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[12px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{ds.total_images}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono"
                          style={{ background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}40` }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: catColor, boxShadow: `0 0 6px ${catColor}` }} />
                          {ds.category}
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-16">
                <Database size={40} className="mx-auto mb-3" style={{ color: '#5EEAD4', opacity: 0.3 }} />
                <div className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>NO DATASETS FOUND</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}
          onClick={closeModal}>
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded"
            style={{ background: '#0A0F14', border: '1px solid rgba(94, 234, 212, 0.3)' }}>

            <div className="flex items-center justify-between p-5"
              style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded flex items-center justify-center"
                  style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
                  <ShieldCheck size={18} style={{ color: '#5EEAD4' }} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold font-mono tracking-wider" style={{ color: '#FFFFFF' }}>DATASET_INTEGRITY_FLOW</h2>
                  <p className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>
                    UPLOAD → HASH → ANALYZE → SCORE → RECORD → VERDICT
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="text-[18px]" style={{ color: '#5EEAD4', opacity: 0.6 }}>×</button>
            </div>

            <div className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
              {[
                { id: 'upload', label: 'UPLOAD', icon: Upload },
                { id: 'hash', label: 'HASH', icon: Hash },
                { id: 'analyze', label: 'ANALYZE', icon: Eye },
                { id: 'score', label: 'SCORE', icon: CheckCircle2 },
                { id: 'record', label: 'RECORD', icon: Lock },
                { id: 'verdict', label: 'VERDICT', icon: FileCheck },
              ].map((s, i) => {
                const stages = ['idle', 'upload', 'hash', 'analyze', 'score', 'record', 'verdict']
                const currentIdx = stages.indexOf(flowStage)
                const stepIdx = stages.indexOf(s.id)
                const done = currentIdx > stepIdx
                const active = flowStage === s.id
                const Icon = s.icon
                return (
                  <div key={s.id} className="flex items-center gap-1.5 flex-1">
                    <div className="w-7 h-7 rounded flex items-center justify-center"
                      style={{
                        background: done || active ? 'rgba(94, 234, 212, 0.15)' : 'rgba(94, 234, 212, 0.05)',
                        border: `1px solid ${done || active ? 'rgba(94, 234, 212, 0.5)' : 'rgba(94, 234, 212, 0.15)'}`,
                      }}>
                      {done ? <CheckCircle2 size={12} style={{ color: '#5EEAD4' }} /> : <Icon size={12} style={{ color: active ? '#5EEAD4' : '#5EEAD4', opacity: active ? 1 : 0.4 }} />}
                    </div>
                    <span className="text-[9px] font-mono tracking-wider"
                      style={{ color: '#5EEAD4', opacity: done || active ? 1 : 0.4 }}>{s.label}</span>
                    {i < 5 && <div className="flex-1 h-px" style={{ background: done ? '#5EEAD4' : 'rgba(94, 234, 212, 0.15)' }} />}
                  </div>
                )
              })}
            </div>

            <div className="p-6">
              {flowStage === 'idle' && (
                <div
                  className="rounded p-12 text-center cursor-pointer transition-all"
                  style={{ border: '2px dashed rgba(94, 234, 212, 0.3)', background: 'rgba(94, 234, 212, 0.02)' }}
                  onClick={() => document.getElementById('dataset-flow-input')?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) runFlow(file) }}>
                  <input id="dataset-flow-input" type="file" className="hidden"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) runFlow(file) }} />
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
                    <Upload size={28} style={{ color: '#5EEAD4' }} />
                  </div>
                  <div className="text-[14px] font-bold font-mono mb-1" style={{ color: '#FFFFFF' }}>CLICK_OR_DROP_FILE</div>
                  <div className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                    ZIP · TAR · GZ · JPG · PNG · MP4 · AVI
                  </div>
                </div>
              )}

              {flowStage === 'upload' && flowFile && (
                <div className="text-center py-8">
                  <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: '#5EEAD4' }} />
                  <div className="text-[14px] font-bold font-mono" style={{ color: '#FFFFFF' }}>UPLOADING {flowFile.name}...</div>
                  <div className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>{(flowFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              )}

              {flowStage === 'hash' && flowData && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <Loader2 size={32} className="animate-spin mx-auto mb-2" style={{ color: '#5EEAD4' }} />
                    <div className="text-[13px] font-bold font-mono" style={{ color: '#FFFFFF' }}>COMPUTING SHA-256 & MINTING BLOCK...</div>
                  </div>
                  <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Hash size={12} style={{ color: '#5EEAD4' }} />
                      <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4', opacity: 0.6 }}>SHA-256_DIGEST</span>
                    </div>
                    <div className="text-[10px] font-mono break-all" style={{ color: '#5EEAD4' }}>{flowData.hash}</div>
                  </div>
                </div>
              )}

              {flowStage === 'analyze' && (
                <div className="space-y-3">
                  <div className="text-[13px] font-bold font-mono mb-3" style={{ color: '#FFFFFF' }}>RUNNING 6 DETECTORS...</div>
                  {['BLUR_DETECTION', 'NOISE_DETECTION', 'BRIGHTNESS', 'CONTRAST', 'DUPLICATES', 'RESOLUTION'].map((d, i) => (
                    <motion.div key={d} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                      className="flex items-center gap-3 p-2.5 rounded"
                      style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
                      <CheckCircle2 size={14} style={{ color: '#5EEAD4' }} />
                      <span className="text-[11px] font-mono tracking-wider" style={{ color: '#FFFFFF' }}>{d}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {(flowStage === 'score' || flowStage === 'record' || flowStage === 'verdict') && flowData && (
                <div className="space-y-4">
                  <div className="p-4 rounded" style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5EEAD4', opacity: 0.6 }}>TRUST_SCORE</span>
                      <span className="text-[24px] font-bold font-mono"
                        style={{ color: flowData.overall >= 80 ? '#5EEAD4' : flowData.overall >= 50 ? '#FBBF24' : '#F87171' }}>
                        {flowData.overall}/100
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden mb-3"
                      style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${flowData.overall}%`, background: flowData.overall >= 80 ? '#5EEAD4' : flowData.overall >= 50 ? '#FBBF24' : '#F87171' }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>GRADE</span>
                      <span className="text-[16px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{flowData.grade}</span>
                    </div>
                  </div>

                  {flowStage !== 'score' && (
                    <div className="p-3 rounded" style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
                      <div className="flex items-center gap-2">
                        <Lock size={14} style={{ color: '#5EEAD4' }} />
                        <span className="text-[11px] font-mono tracking-wider" style={{ color: '#5EEAD4' }}>RECORDED_ON_BLOCKCHAIN</span>
                      </div>
                      <div className="text-[10px] font-mono mt-1" style={{ color: '#5EEAD4', opacity: 0.6 }}>Block #{flowData.block}</div>
                    </div>
                  )}

                  {flowStage === 'verdict' && (
                    <div className="p-4 rounded flex items-center gap-3"
                      style={{
                        background: flowData.verdict === 'accept' ? 'rgba(94, 234, 212, 0.1)' : flowData.verdict === 'review' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        border: `1px solid ${flowData.verdict === 'accept' ? 'rgba(94, 234, 212, 0.5)' : flowData.verdict === 'review' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(248, 113, 113, 0.5)'}`,
                      }}>
                      {flowData.verdict === 'accept' && <CheckCircle2 size={28} style={{ color: '#5EEAD4' }} />}
                      {flowData.verdict === 'review' && <AlertTriangle size={28} style={{ color: '#FBBF24' }} />}
                      {flowData.verdict === 'quarantine' && <AlertTriangle size={28} style={{ color: '#F87171' }} />}
                      <div>
                        <div className="font-bold text-[16px] font-mono tracking-wider"
                          style={{ color: flowData.verdict === 'accept' ? '#5EEAD4' : flowData.verdict === 'review' ? '#FBBF24' : '#F87171' }}>
                          {flowData.verdict === 'accept' ? 'ACCEPT' : flowData.verdict === 'review' ? 'REVIEW' : 'QUARANTINE'}
                        </div>
                        <div className="text-[11px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>
                          {flowData.verdict === 'accept' ? 'Dataset verified & safe' : flowData.verdict === 'review' ? 'Manual review required' : 'Do not use'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(94, 234, 212, 0.15)' }}>
              <div className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>
                {flowData ? `FILE: ${flowData.fileName}` : 'NO_FILE_UPLOADED'}
              </div>
              <div className="flex gap-2">
                {flowStage === 'verdict' && (
                  <>
                    <button onClick={resetFlow}
                      className="px-4 py-2 rounded text-[11px] font-mono tracking-wider"
                      style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
                      ANALYZE_ANOTHER
                    </button>
                    <button onClick={closeModal}
                      className="px-4 py-2 rounded text-[11px] font-mono tracking-wider font-bold"
                      style={{ background: '#5EEAD4', color: '#08080C' }}>
                      DONE
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
