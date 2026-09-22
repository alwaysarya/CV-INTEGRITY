import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, CheckCircle, Brain, Database, Hash, Shield, AlertTriangle, Download, FileText } from 'lucide-react'
import apiClient from '@/lib/api'
import { notify } from '@/lib/toast'

interface AssuranceReport {
  timestamp: string
  overall_status: string
  modules: {
    [key: string]: {
      status: string
      [key: string]: any
    }
  }
}

export function AssuranceReport() {
  const [report, setReport] = useState<AssuranceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getAssuranceReport()
      setReport(res.data)
      notify.success('Report loaded', 'Complete assurance data fetched')
    } catch (err: any) {
      setError(err.message || 'Backend connect nahi ho raha')
      notify.error('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `assurance-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    notify.success('Report exported', 'JSON file downloaded')
  }

  const moduleIcons: Record<string, any> = {
    model_integrity: Brain,
    dataset_integrity: Database,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">Assurance Report</h1>
          <p className="text-gray-400 text-sm">
            Complete platform integrity assessment
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportReport}
            disabled={!report}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 text-sm font-medium hover:bg-purple-500/30 disabled:opacity-50 hover-scale"
          >
            <Download size={16} /> Export JSON
          </button>
          <button
            onClick={loadReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium hover:bg-cyan-500/30 hover-scale"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </motion.div>

      {error && (
        <Card className="glass-card p-4 border-red-500/40 bg-red-500/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={20} />
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="liquid-glass border-0 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400 mb-4" size={48} />
            <span className="text-gray-400">Generating assurance report...</span>
          </div>
        </Card>
      ) : report ? (
        <>
          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="liquid-glass specular border-0 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center glow-green">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs tracking-widest uppercase mb-1">Overall Status</div>
                    <div className="text-4xl font-bold text-green-400">
                      {report.overall_status.toUpperCase()}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      Generated: {new Date(report.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(report.modules).map(([key, value]: [string, any], i) => {
              const Icon = moduleIcons[key] || Shield
              const isSuccess = value.status === 'success'
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  <Card className="liquid-glass specular border-0 p-5 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                          }}
                        >
                          <Icon size={20} style={{ color: isSuccess ? '#10B981' : '#EF4444' }} />
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="text-gray-500 text-xs">Module status</div>
                        </div>
                      </div>
                      <Badge
                        className="text-[10px] py-0.5 px-2"
                        style={{
                          backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isSuccess ? '#10B981' : '#EF4444',
                          border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                        }}
                      >
                        ● {value.status}
                      </Badge>
                    </div>

                    {/* Module-specific content */}
                    {key === 'model_integrity' && value.models && (
                      <div className="space-y-2">
                        <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">
                          {value.models_analyzed} Models Analyzed
                        </div>
                        {value.models.map((m: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-cyan-500/10">
                            <div className="flex items-center gap-2">
                              <Brain size={12} className="text-green-400" />
                              <span className="text-white text-xs font-bold">{m.name.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 text-[10px]">{m.size_mb} MB</span>
                              <span className="text-cyan-400 text-[10px] font-mono">{m.hash}...</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {key === 'dataset_integrity' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 rounded-lg bg-black/30 border border-cyan-500/10">
                            <div className="text-gray-500 text-[9px] uppercase">Format</div>
                            <div className="text-white text-xs font-bold uppercase">{value.format}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-black/30 border border-cyan-500/10">
                            <div className="text-gray-500 text-[9px] uppercase">Images</div>
                            <div className="text-white text-xs font-bold">{value.num_images}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-black/30 border border-cyan-500/10">
                            <div className="text-gray-500 text-[9px] uppercase">Labels</div>
                            <div className="text-white text-xs font-bold">{value.num_labels}</div>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-black/30 border border-cyan-500/10">
                          <div className="text-gray-500 text-[9px] uppercase">Dataset Hash</div>
                          <div className="text-cyan-400 text-[10px] font-mono">{value.dataset_hash}...</div>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Summary Card */}
          <Card className="liquid-glass border-0 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-cyan-400" />
              <h3 className="text-white font-bold text-sm">SUMMARY</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Report ID</div>
                <div className="text-white text-xs font-mono">{report.timestamp}</div>
              </div>
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Modules Analyzed</div>
                <div className="text-white text-sm font-bold">{Object.keys(report.modules).length}</div>
              </div>
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Status</div>
                <div className="text-green-400 text-sm font-bold">{report.overall_status.toUpperCase()}</div>
              </div>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  )
}
