import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Brain, Hash, Database, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import apiClient from '@/lib/api'

interface ModelFingerprint {
  name: string
  path: string
  status: string
  model_hash: string
  model_size_bytes: number
  parameter_count: number
  framework: string
}

export function ModelIntegrity() {
  const [models, setModels] = useState<ModelFingerprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFingerprints()
  }, [])

  const loadFingerprints = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getModelFingerprints()
      setModels(res.data.fingerprints || [])
    } catch (err: any) {
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const stats = {
    total: models.length,
    verified: models.filter((m) => m.status === 'success').length,
    totalSize: models.reduce((s, m) => s + m.model_size_bytes, 0),
    totalParams: models.reduce((s, m) => s + (m.parameter_count || 0), 0),
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
          <h1 className="text-3xl font-bold gradient-text mb-1">Model Integrity</h1>
          <p className="text-gray-400 text-sm">
            SHA-256 fingerprinting for {models.length} real models
          </p>
        </div>
        <button
          onClick={loadFingerprints}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium hover:bg-cyan-500/30 hover-scale"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </motion.div>

      {error && (
        <Card className="glass-card p-4 border-red-500/40 bg-red-500/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <div>
              <div className="text-red-400 font-medium text-sm">Error</div>
              <div className="text-gray-400 text-xs">{error}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Models Loaded', value: stats.total, color: '#38BDF8', icon: Brain },
          { label: 'Verified', value: stats.verified, color: '#10B981', icon: CheckCircle },
          { label: 'Total Size', value: formatBytes(stats.totalSize), color: '#F59E0B', icon: Database },
          { label: 'Total Params', value: `${(stats.totalParams / 1e6).toFixed(1)}M`, color: '#8B5CF6', icon: Hash },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="liquid-glass specular p-5 border-0 hover-lift">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400 text-xs">{stat.label}</div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Models List */}
      <Card className="liquid-glass border-0 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">MODEL FINGERPRINTS</h3>
          <p className="text-gray-500 text-xs mt-0.5">SHA-256 hashes for integrity verification</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Loading fingerprints...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {models.map((model, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-4 rounded-xl bg-black/30 border border-cyan-500/10 hover:border-cyan-500/30 hover:translate-x-1 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <Brain size={18} className="text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{model.name.toUpperCase()}</div>
                      <div className="text-gray-500 text-[10px] font-mono">{model.path.split('/').slice(-3).join('/')}</div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1">
                    <CheckCircle size={10} />
                    {model.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-2 rounded-lg bg-black/20 border border-cyan-500/10">
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">Framework</div>
                    <div className="text-white text-xs font-bold">{model.framework}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/20 border border-cyan-500/10">
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">Size</div>
                    <div className="text-white text-xs font-bold">{formatBytes(model.model_size_bytes)}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/20 border border-cyan-500/10">
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">Parameters</div>
                    <div className="text-white text-xs font-bold">
                      {model.parameter_count ? model.parameter_count.toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/20 border border-cyan-500/10">
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">Hash (SHA-256)</div>
                    <div className="text-cyan-400 text-[10px] font-mono">{model.model_hash?.substring(0, 16)}...</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
