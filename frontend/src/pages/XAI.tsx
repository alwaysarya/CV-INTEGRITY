import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Brain, Search, Eye, Target, Layers, Zap, Image as ImageIcon } from 'lucide-react'

interface Explanation {
  id: number
  model: string
  prediction: string
  confidence: number
  method: 'GradCAM' | 'SHAP' | 'LIME' | 'Integrated Gradients'
  image: string
  timestamp: string
}

const staticExplanations: Explanation[] = [
  { id: 1, model: 'YOLOv8n', prediction: 'Person (94%)', confidence: 94, method: 'GradCAM', image: 'person-001.jpg', timestamp: '2 min ago' },
  { id: 2, model: 'ResNet50', prediction: 'Car (87%)', confidence: 87, method: 'SHAP', image: 'car-042.jpg', timestamp: '8 min ago' },
  { id: 3, model: 'YOLOv8n', prediction: 'Bicycle (78%)', confidence: 78, method: 'GradCAM', image: 'bike-017.jpg', timestamp: '15 min ago' },
  { id: 4, model: 'ViT-B/16', prediction: 'Traffic Light (92%)', confidence: 92, method: 'LIME', image: 'light-023.jpg', timestamp: '28 min ago' },
  { id: 5, model: 'ResNet50', prediction: 'Dog (96%)', confidence: 96, method: 'SHAP', image: 'dog-108.jpg', timestamp: '1 hr ago' },
  { id: 6, model: 'YOLOv8n', prediction: 'Truck (89%)', confidence: 89, method: 'Integrated Gradients', image: 'truck-055.jpg', timestamp: '2 hr ago' },
]

const methodColors = {
  GradCAM: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  SHAP: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
  LIME: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.4)' },
  'Integrated Gradients': { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
}

export function XAI() {
  const [explanations] = useState<Explanation[]>(staticExplanations)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Explanation | null>(staticExplanations[0])

  const filtered = explanations.filter((e) => {
    const matchesSearch = e.model.toLowerCase().includes(search.toLowerCase()) || e.prediction.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || e.method === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: explanations.length,
    avgConfidence: Math.round(explanations.reduce((sum, e) => sum + e.confidence, 0) / explanations.length),
    methods: new Set(explanations.map((e) => e.method)).size,
    models: new Set(explanations.map((e) => e.model)).size,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Explainable AI</h1>
          <p className="text-gray-400 text-sm">Understand why models make their decisions</p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 gap-1.5 py-2 px-3">
          <Brain size={12} />
          XAI Enabled
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Explanations', value: stats.total, color: '#38BDF8', icon: Brain },
          { label: 'Avg Confidence', value: `${stats.avgConfidence}%`, color: '#10B981', icon: Target },
          { label: 'Methods Used', value: stats.methods, color: '#8B5CF6', icon: Layers },
          { label: 'Models', value: stats.models, color: '#F59E0B', icon: Zap },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card border-cyan-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon size={14} className="text-cyan-400" />
                <h3 className="text-white font-bold text-sm">ORIGINAL INPUT</h3>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[10px]">
                {selected.image}
              </Badge>
            </div>
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#1a1f2e] to-[#0a0f1e] relative">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon size={48} className="text-gray-600 mx-auto mb-2" />
                  <div className="text-gray-500 text-xs">Original Image</div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-black/30 border border-cyan-500/10">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Prediction</div>
              <div className="text-white text-sm font-bold">{selected.prediction}</div>
            </div>
          </Card>

          <Card className="glass-card border-cyan-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-red-400" />
                <h3 className="text-white font-bold text-sm">ATTENTION HEATMAP</h3>
              </div>
              <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: methodColors[selected.method].bg, color: methodColors[selected.method].text, border: `1px solid ${methodColors[selected.method].border}` }}>
                {selected.method}
              </Badge>
            </div>
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#1a1f2e] to-[#0a0f1e] relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full" style={{
                    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.8), rgba(245, 158, 11, 0.5), rgba(239, 68, 68, 0.1), transparent 70%)',
                    filter: 'blur(15px)',
                  }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-xs font-bold tracking-wider">HOT REGION</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-black/30 border border-cyan-500/10">
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Confidence</div>
                <div className="text-green-400 text-sm font-bold">{selected.confidence}%</div>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-cyan-500/10">
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Focus Region</div>
                <div className="text-purple-400 text-sm font-bold">Top-Right</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="glass-card border-cyan-500/20 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search explanations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'GradCAM', 'SHAP', 'LIME', 'Integrated Gradients'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-gray-500 hover:text-gray-300 border border-cyan-500/10'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Model</th>
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Prediction</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Confidence</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Method</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Time</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => {
                const colors = methodColors[exp.method]
                return (
                  <tr
                    key={exp.id}
                    onClick={() => setSelected(exp)}
                    className={`border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors cursor-pointer ${selected?.id === exp.id ? 'bg-cyan-500/10' : ''}`}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                          <Brain size={14} className="text-purple-400" />
                        </div>
                        <div className="text-white text-xs font-medium">{exp.model}</div>
                      </div>
                    </td>
                    <td className="py-3"><div className="text-gray-300 text-xs">{exp.prediction}</div></td>
                    <td className="py-3 text-right"><div className="text-green-400 text-xs font-bold">{exp.confidence}%</div></td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        {exp.method}
                      </Badge>
                    </td>
                    <td className="py-3 text-right"><div className="text-gray-500 text-xs">{exp.timestamp}</div></td>
                    <td className="py-3 text-right">
                      <button className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
