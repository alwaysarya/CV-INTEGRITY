import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Upload } from 'lucide-react'

interface Dataset {
  name: string
  type: string
  size: string
  status: 'Verified' | 'Processing' | 'Flagged'
}

const datasets: Dataset[] = [
  { name: 'ImageNet-1K', type: 'Image', size: '46.8 GB', status: 'Verified' },
  { name: 'COCO-2017', type: 'Image', size: '25.3 GB', status: 'Verified' },
  { name: 'OpenImages-v7', type: 'Image', size: '102 GB', status: 'Processing' },
  { name: 'LAION-5B', type: 'Image', size: '1.2 TB', status: 'Verified' },
  { name: 'Custom-Data', type: 'Video', size: '34.1 GB', status: 'Verified' },
  { name: 'Drone-Detection', type: 'Video', size: '18.6 GB', status: 'Flagged' },
]

const statusColors = {
  Verified: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Processing: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Flagged: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
}

export function DatasetTable() {
  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Database size={14} className="text-cyan-400" />
            DATASET STATUS
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Manage and verify datasets</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-medium hover:bg-cyan-500/25 transition-colors">
          <Upload size={10} />
          Upload Dataset
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cyan-500/10">
              <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-2">Name</th>
              <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-2">Type</th>
              <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-2">Size</th>
              <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset, i) => {
              const colors = statusColors[dataset.status]
              return (
                <tr key={i} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                  <td className="py-2.5"><div className="text-white text-xs font-medium">{dataset.name}</div></td>
                  <td className="py-2.5"><div className="text-gray-400 text-xs">{dataset.type}</div></td>
                  <td className="py-2.5 text-right"><span className="text-gray-300 text-xs font-medium">{dataset.size}</span></td>
                  <td className="py-2.5 text-right">
                    <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                      ● {dataset.status}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
