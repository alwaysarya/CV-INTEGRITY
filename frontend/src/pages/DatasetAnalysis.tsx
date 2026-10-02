import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Database, Image as ImageIcon, Layers, Target, Search, Upload as UploadIcon } from 'lucide-react'
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

  // Deep Analysis state
  const [selectedDataset, setSelectedDataset] = useState<'good' | 'bad' | 'worst'>('good')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisScore | null>(null)

  useEffect(() => {
    loadDatasets()
    runAnalysis('good')  // default load
  }, [])

  const loadDatasets = async () => {
    setLoading(true)
    try {
      const res = await apiClient.getAvailableDatasets()
      // API different formats return kar sakta hai
      const raw = res.data
      const list: Dataset[] = Array.isArray(raw) ? raw
        : Array.isArray(raw.datasets) ? raw.datasets
        : raw.data && Array.isArray(raw.data) ? raw.data
        : []
      setDatasets(list)
      if (list.length > 0) {
        setSelected(list[0])
        loadDetails(list[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadDetails = async (ds: Dataset) => {
    setLoadingDetails(true)
    try {
      const res = await apiClient.loadDataset(ds.path)
      setDetails(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleSelect = (ds: Dataset) => {
    setSelected(ds)
    loadDetails(ds)
  }

  // REAL API call — fetch live analysis
  const runAnalysis = async (dsName: 'good' | 'bad' | 'worst') => {
    setAnalyzing(true)
    setSelectedDataset(dsName)
    try {
      const res = await fetch(`${API}/api/datasets/${dsName}`)
      const data = await res.json()
      setAnalysisResults(data)
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const getGrade = (score: number): string => {
    if (score >= 90) return 'A'
    if (score >= 75) return 'B'
    if (score >= 60) return 'C'
    if (score >= 45) return 'D'
    return 'F'
  }

  const getGradeColor = (grade: string): string => {
    if (grade === 'A') return 'text-green-400'
    if (grade === 'B') return 'text-cyan-400'
    if (grade === 'C') return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6 p-6" style={{ background: '#0A0F14', minHeight: 'calc(100vh - 72px)' }}>

      {/* ============= HEADER ============= */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#E5F5F0] mb-1">Dataset Analysis</h1>
            <p className="text-[#8AA4A0] text-sm">
              COCO + YOLO format loaders · Real-time analysis · Cryptographic fingerprints
            </p>
          </div>
          <button
            onClick={loadDatasets}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs hover:bg-cyan-500/20 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ============= DATASET SELECTOR ============= */}
        <Card className="rounded-3xl p-5 mb-6 bg-[#0F1419] border border-cyan-500/20">
          <div className="mb-3">
            <label className="text-[#5EEAD4] text-[10px] uppercase tracking-wider font-bold">SELECT DATASET</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {(['good', 'bad', 'worst'] as const).map((ds) => (
              <button
                key={ds}
                onClick={() => runAnalysis(ds)}
                disabled={analyzing}
                className={`px-4 py-3 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 ${
                  selectedDataset === ds
                    ? 'bg-[rgba(94,234,212,0.15)] text-[#FFFFFF] border-[rgba(94,234,212,0.5)]'
                    : 'bg-[rgba(94,234,212,0.05)] text-[#5EEAD4] border-[rgba(94,234,212,0.2)] hover:border-[rgba(94,234,212,0.4)]'
                }`}
              >
                {ds.charAt(0).toUpperCase() + ds.slice(1)}
              </button>
            ))}
            <button
              onClick={() => runAnalysis(selectedDataset)}
              disabled={analyzing}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-medium bg-gradient-to-r from-[#5EEAD4] to-[#38BDF8] text-[#0A0F14] hover:opacity-90 transition-all disabled:opacity-50 font-bold"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={12} /> Analyzing...
                </>
              ) : (
                <>▶ Run Analysis</>
              )}
            </button>
          </div>
        </Card>

        {/* ============= ANALYSIS RESULTS ============= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Composite Scores */}
          <Card className="rounded-3xl p-5 bg-[#0F1419] border border-cyan-500/20">
            <div className="mb-4">
              <h3 className="text-[#E5F5F0] font-bold text-sm">Composite Quality Scores</h3>
              <p className="text-[#8AA4A0] text-xs mt-0.5">
                {analysisResults ? `${analysisResults.total_images} images analyzed` : 'Select dataset'}
              </p>
            </div>
            {analysisResults ? (
              <div className="space-y-4">
                {[
                  { label: 'Overall Score', value: analysisResults.scores.overall_score, color: '#5EEAD4' },
                  { label: 'Blur Score', value: analysisResults.scores.blur_score, color: '#38BDF8' },
                  { label: 'Duplicate Score', value: analysisResults.scores.duplicate_score, color: '#F59E0B' },
                  { label: 'Noise Score', value: analysisResults.scores.noise_score, color: '#8B5CF6' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[#8AA4A0] text-xs">{s.label}</span>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}%</span>
                    </div>
                    <div className="h-2 bg-[#0A0F14] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${s.value}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-cyan-500/10 flex justify-between items-center">
                  <span className="text-[#8AA4A0] text-xs">Grade</span>
                  <span className={`text-lg font-bold ${getGradeColor(getGrade(analysisResults.scores.overall_score))}`}>
                    {getGrade(analysisResults.scores.overall_score)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#8AA4A0] text-xs">Run analysis to see scores</div>
            )}
          </Card>

          {/* Detector Details */}
          <Card className="rounded-3xl p-5 bg-[#0F1419] border border-cyan-500/20">
            <div className="mb-4">
              <h3 className="text-[#E5F5F0] font-bold text-sm">Detector Analysis Results</h3>
              <p className="text-[#8AA4A0] text-xs mt-0.5">Real CV detector outputs</p>
            </div>
            {analysisResults ? (
              <div className="space-y-3">
                {[
                  { name: 'Blur Detection', value: analysisResults.scores.blur_score, color: '#38BDF8' },
                  { name: 'Duplicate Detection', value: analysisResults.scores.duplicate_score, color: '#F59E0B' },
                  { name: 'Noise Detection', value: analysisResults.scores.noise_score, color: '#8B5CF6' },
                  { name: 'Overall Quality', value: analysisResults.scores.overall_score, color: '#5EEAD4' },
                ].map((det, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#8AA4A0] text-xs">{det.name}</span>
                      <span className="text-xs font-bold" style={{ color: det.color }}>{det.value}%</span>
                    </div>
                    <div className="h-1.5 bg-[#0A0F14] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${det.value}%`, background: det.color }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#8AA4A0] text-xs">Run analysis to see detector results</div>
            )}
          </Card>
        </div>

        {/* ============= DATASETS EXPLORER — real from API ============= */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-[#E5F5F0] mb-1">Datasets Explorer</h2>
            <p className="text-[#8AA4A0] text-sm">Cryptographically fingerprinted & audited CV datasets</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5EEAD4]" />
              <input
                type="text"
                placeholder="Filter datasets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg bg-[rgba(94,234,212,0.05)] border border-[rgba(94,234,212,0.2)] text-[#E5F5F0] text-xs focus:border-cyan-500/60 outline-none w-64"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="lg:col-span-3 flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-cyan-400" size={28} />
              <span className="ml-3 text-[#8AA4A0]">Loading datasets...</span>
            </div>
          ) : datasets.length === 0 ? (
            <div className="lg:col-span-3 text-center py-12 text-[#8AA4A0]">
              <Database size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No datasets found</p>
            </div>
          ) : (
            datasets
              .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()))
              .map((ds, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="rounded-3xl p-5 bg-[#0F1419] border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer"
                    onClick={() => handleSelect(ds)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[9px] py-0.5 px-2">
                        {ds.format.toUpperCase()}
                      </Badge>
                      <span className="text-[#5EEAD4] text-[10px]">
                        {ds.exists ? '✅ Available' : '⚠️ Missing'}
                      </span>
                    </div>
                    <h3 className="text-[#E5F5F0] font-bold text-sm mb-1">{ds.name}</h3>
                    <p className="text-[#8AA4A0] text-[10px] font-mono mb-4 truncate">{ds.path}</p>
                    <div className="flex items-center justify-between text-[10px] pt-3 border-t border-cyan-500/10">
                      <span className="text-[#5EEAD4]">Click to view details</span>
                      <span className="text-[#5EEAD4]">→</span>
                    </div>
                  </Card>
                </motion.div>
              ))
          )}
        </div>
      </motion.div>

      {/* ============= BOTTOM: Dataset Details ============= */}
      {details && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {details.num_images !== undefined && (
              <Card className="rounded-3xl p-4 bg-[#0F1419] border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-[rgba(94,234,212,0.4)] flex items-center justify-center">
                    <ImageIcon size={18} className="text-[#5EEAD4]" />
                  </div>
                  <div>
                    <div className="text-[#E5F5F0] text-2xl font-bold">{details.num_images.toLocaleString()}</div>
                    <div className="text-[#8AA4A0] text-xs">Images</div>
                  </div>
                </div>
              </Card>
            )}
            {details.num_annotations !== undefined && (
              <Card className="rounded-3xl p-4 bg-[#0F1419] border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                    <Target size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="text-[#E5F5F0] text-2xl font-bold">{details.num_annotations.toLocaleString()}</div>
                    <div className="text-[#8AA4A0] text-xs">Annotations</div>
                  </div>
                </div>
              </Card>
            )}
            {details.num_categories !== undefined && (
              <Card className="rounded-3xl p-4 bg-[#0F1419] border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                    <Layers size={18} className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-[#E5F5F0] text-2xl font-bold">{details.num_categories}</div>
                    <div className="text-[#8AA4A0] text-xs">Categories</div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {details.categories && details.categories.length > 0 && (
            <Card className="rounded-3xl p-5 bg-[#0F1419] border border-cyan-500/20">
              <div className="mb-4">
                <h3 className="text-[#E5F5F0] font-bold text-sm">CATEGORIES ({details.categories.length})</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {details.categories.slice(0, 30).map((cat, i) => (
                  <Badge key={i} className="text-[10px] py-1 px-2.5 bg-cyan-500/10 text-[#5EEAD4] border border-cyan-500/30">
                    {cat}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
