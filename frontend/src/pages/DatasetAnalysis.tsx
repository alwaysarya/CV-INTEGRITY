import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Loader2, RefreshCw, Database, Image as ImageIcon, Layers, Target,
  Search, Scan, ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp
} from 'lucide-react'
import apiClient from '@/lib/api'

const API = 'http://localhost:8000'

interface Dataset {
  name: string
  path: string
  format: string
  exists: boolean
}

interface DatasetDetails {
  format: string
  num_images?: number
  num_labels?: number
  num_annotations?: number
  num_categories?: number
  categories?: string[]
  dataset_hash?: string
  class_names?: string[]
}

interface AnalysisScore {
  dataset_name: string
  total_images: number
  scores: {
    blur_score: number
    duplicate_score: number
    noise_score: number
    overall_score: number
  }
  details?: any
}

export function DatasetAnalysis() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selected, setSelected] = useState<Dataset | null>(null)
  const [details, setDetails] = useState<DatasetDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()
  const uploadedFile = searchParams.get('file')

  const [selectedDataset, setSelectedDataset] = useState<'good' | 'bad' | 'worst'>('good')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisScore | null>(null)

  useEffect(() => {
    loadDatasets()
    runAnalysis('good')
  }, [])

  const loadDatasets = async () => {
    setLoading(true)
    try {
      const res = await apiClient.getDatasets()
      const data = res.data
      const list: Dataset[] = []
      if (data.datasets && typeof data.datasets === 'object') {
        Object.entries(data.datasets).forEach(([key, val]: [string, any]) => {
          list.push({
            name: key,
            path: val.path || `datasets/${key}`,
            format: val.format || 'yolo',
            exists: true,
          })
        })
      }
      setDatasets(list)
      if (list.length > 0 && !selected) setSelected(list[0])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const loadDetails = async (ds: Dataset) => {
    setLoadingDetails(true)
    setSelected(ds)
    try {
      const res = await fetch(`${API}/api/datasets/${ds.name}/details`).then(r => r.json()).catch(() => null)
      setDetails(res)
    } finally { setLoadingDetails(false) }
  }

  const runAnalysis = async (key: 'good' | 'bad' | 'worst') => {
    setSelectedDataset(key)
    setAnalyzing(true)
    setAnalysisResults(null)
    try {
      const res = await fetch(`${API}/api/datasets`).then(r => r.json()).catch(() => null)
      const dataset = res?.datasets?.[key]
      if (dataset) {
        setAnalysisResults({
          dataset_name: dataset.name || key.toUpperCase(),
          total_images: dataset.total_images || 0,
          scores: {
            blur_score: dataset.blur_score || 0,
            duplicate_score: dataset.duplicate_score || 0,
            noise_score: dataset.noise_score || 0,
            overall_score: dataset.overall_score || 0,
          },
          details: dataset,
        })
      }
    } finally { setAnalyzing(false) }
  }

  const getTheme = (score: number) => {
    if (score >= 75) return { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Good' }
    if (score >= 50) return { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Review' }
    return { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Critical' }
  }

  const filtered = datasets.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Dataset Analysis
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Deep Dataset Analysis
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Blur, noise, duplicate and quality analysis across dataset variants.
            </p>
          </div>
          <button
            onClick={loadDatasets}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Dataset variant selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-slate-900">Select Dataset Variant</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Run deep analysis on a specific dataset</div>
            </div>
          </div>
          <div className="flex gap-2">
            {(['good', 'bad', 'worst'] as const).map(key => (
              <button
                key={key}
                onClick={() => runAnalysis(key)}
                className={`flex-1 rounded-xl border px-4 py-3 text-left transition-all ${
                  selectedDataset === key
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`text-[13px] font-semibold uppercase ${selectedDataset === key ? 'text-emerald-900' : 'text-slate-800'}`}>
                  {key}
                </div>
                <div className="mt-0.5 text-[10px] text-slate-500">Dataset variant</div>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis results */}
        <div className="mt-6">
          {analyzing ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Analyzing {selectedDataset} dataset...
            </div>
          ) : analysisResults ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Overall */}
              {(() => {
                const score = analysisResults.scores.overall_score
                const theme = getTheme(score)
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: theme.bg }}>
                        <TrendingUp size={18} style={{ color: theme.text }} />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-slate-500">Overall Quality</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {analysisResults.dataset_name.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 text-[44px] font-bold leading-none tracking-tight" style={{ color: theme.dot }}>
                      {score.toFixed(1)}
                      <span className="text-[20px]">%</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(score, 100)}%` }}
                        transition={{ duration: 0.9 }}
                        className="h-full rounded-full"
                        style={{ background: theme.dot }}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{analysisResults.total_images} images</span>
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: theme.bg, color: theme.text }}
                      >
                        {theme.label}
                      </span>
                    </div>
                  </motion.div>
                )
              })()}

              {/* Sub-scores */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-4">
                  <div className="text-[14px] font-semibold text-slate-900">Quality Breakdown</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">Blur, duplicate and noise scores</div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Blur Score', value: analysisResults.scores.blur_score, color: '#3B82F6', icon: Scan, desc: 'Sharpness of images' },
                    { label: 'Duplicate Score', value: analysisResults.scores.duplicate_score, color: '#8B5CF6', icon: Layers, desc: 'Unique content ratio' },
                    { label: 'Noise Score', value: analysisResults.scores.noise_score, color: '#F59E0B', icon: Target, desc: 'Signal-to-noise quality' },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <metric.icon size={13} style={{ color: metric.color }} />
                          <span className="text-[12px] font-medium text-slate-700">{metric.label}</span>
                          <span className="text-[10px] text-slate-400">· {metric.desc}</span>
                        </div>
                        <span className="font-mono text-[13px] font-bold" style={{ color: metric.color }}>
                          {metric.value.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(metric.value, 100)}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: metric.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
              <Database size={32} className="mx-auto text-slate-400" />
              <div className="mt-3 text-[14px] font-medium text-slate-700">No analysis data</div>
              <div className="mt-1 text-[11px] text-slate-500">Select a variant above to run analysis</div>
            </div>
          )}
        </div>

        {/* Dataset details (if uploaded) */}
        {uploadedFile && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-blue-600" />
              <span className="text-[12px] font-medium text-blue-800">
                Uploaded file: {uploadedFile}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DatasetAnalysis
