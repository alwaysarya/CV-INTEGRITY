import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Database, Hash, Image as ImageIcon, FileText, CheckCircle, Layers, Target } from 'lucide-react'
import apiClient from '@/lib/api'

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

export function DatasetAnalysis() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selected, setSelected] = useState<Dataset | null>(null)
  const [details, setDetails] = useState<DatasetDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    loadDatasets()
  }, [])

  const loadDatasets = async () => {
    setLoading(true)
    try {
      const res = await apiClient.getAvailableDatasets()
      const list = res.data.datasets || []
      setDatasets(list)
      if (list.length > 0) {
        handleSelect(list[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (ds: Dataset) => {
    setSelected(ds)
    setLoadingDetails(true)
    setDetails(null)
    try {
      const res = await apiClient.loadDataset(ds.path)
      setDetails(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const formatColors: Record<string, any> = {
    coco: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
    yolo: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
    unknown: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.4)' },
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
          <h1 className="text-3xl font-bold gradient-text mb-1">Dataset Analysis</h1>
          <p className="text-gray-400 text-sm">
            COCO + YOLO format loaders with real datasets
          </p>
        </div>
        <button
          onClick={loadDatasets}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium hover:bg-cyan-500/30 hover-scale"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Datasets List */}
        <Card className="liquid-glass border-0 p-4 lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">AVAILABLE DATASETS</h3>
            <p className="text-gray-500 text-xs mt-0.5">Click to load details</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-cyan-400" size={24} />
            </div>
          ) : (
            <div className="space-y-2">
              {datasets.map((ds, i) => {
                const colors = formatColors[ds.format] || formatColors.unknown
                const isSelected = selected?.path === ds.path
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(ds)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border border-cyan-500/40'
                        : 'bg-black/20 border border-cyan-500/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-white text-xs font-bold">{ds.name}</div>
                      <Badge
                        className="text-[9px] py-0.5 px-1.5"
                        style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                      >
                        {ds.format}
                      </Badge>
                    </div>
                    <div className="text-gray-500 text-[10px] font-mono truncate">{ds.path}</div>
                    {!ds.exists && (
                      <Badge className="mt-1 text-[9px] py-0 px-1.5 bg-red-500/20 text-red-400 border-red-500/40">
                        Missing
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        {/* Details Panel */}
        <div className="lg:col-span-2 space-y-4">
          {loadingDetails ? (
            <Card className="liquid-glass border-0 p-12">
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-400 mr-3" size={24} />
                <span className="text-gray-400 text-sm">Loading dataset...</span>
              </div>
            </Card>
          ) : details ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {details.num_images !== undefined && (
                  <Card className="liquid-glass specular border-0 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                        <ImageIcon size={18} className="text-cyan-400" />
                      </div>
                      <div>
                        <div className="text-white text-2xl font-bold">{details.num_images.toLocaleString()}</div>
                        <div className="text-gray-400 text-xs">Images</div>
                      </div>
                    </div>
                  </Card>
                )}

                {details.num_annotations !== undefined && (
                  <Card className="liquid-glass specular border-0 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                        <Target size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <div className="text-white text-2xl font-bold">{details.num_annotations.toLocaleString()}</div>
                        <div className="text-gray-400 text-xs">Annotations</div>
                      </div>
                    </div>
                  </Card>
                )}

                {details.num_categories !== undefined && (
                  <Card className="liquid-glass specular border-0 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                        <Layers size={18} className="text-green-400" />
                      </div>
                      <div>
                        <div className="text-white text-2xl font-bold">{details.num_categories}</div>
                        <div className="text-gray-400 text-xs">Categories</div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Format Info */}
              <Card className="liquid-glass border-0 p-5">
                <div className="mb-4">
                  <h3 className="text-white font-bold text-sm">DATASET DETAILS</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Format</div>
                    <div className="text-white text-sm font-bold uppercase">{details.format}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Hash (SHA-256)</div>
                    <div className="text-cyan-400 text-xs font-mono">
                      {details.dataset_hash ? details.dataset_hash.substring(0, 16) + '...' : 'N/A'}
                    </div>
                  </div>
                  {details.num_labels !== undefined && (
                    <div>
                      <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Labels</div>
                      <div className="text-white text-sm font-bold">{details.num_labels.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Categories */}
              {details.categories && details.categories.length > 0 && (
                <Card className="liquid-glass border-0 p-5">
                  <div className="mb-4">
                    <h3 className="text-white font-bold text-sm">CATEGORIES ({details.categories.length})</h3>
                    <p className="text-gray-500 text-xs mt-0.5">Class labels in dataset</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {details.categories.map((cat, i) => (
                      <Badge
                        key={i}
                        className="text-[10px] py-1 px-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {details.class_names && details.class_names.length > 0 && (
                <Card className="liquid-glass border-0 p-5">
                  <div className="mb-4">
                    <h3 className="text-white font-bold text-sm">CLASS NAMES ({details.class_names.length})</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {details.class_names.map((cat, i) => (
                      <Badge
                        key={i}
                        className="text-[10px] py-1 px-2.5 bg-green-500/10 text-green-400 border border-green-500/30"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="liquid-glass border-0 p-12">
              <div className="text-center">
                <Database size={48} className="text-gray-600 mx-auto mb-3" />
                <div className="text-gray-400 text-sm">Select a dataset from the left</div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
