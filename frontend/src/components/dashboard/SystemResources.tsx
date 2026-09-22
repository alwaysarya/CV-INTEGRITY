import { Card } from '@/components/ui/card'
import { Cpu, HardDrive, MemoryStick, Server } from 'lucide-react'

interface Resource {
  name: string
  value: number
  icon: any
  color: string
}

const resources: Resource[] = [
  { name: 'CPU', value: 32, icon: Cpu, color: '#38BDF8' },
  { name: 'GPU', value: 67, icon: Server, color: '#F59E0B' },
  { name: 'Memory', value: 54, icon: MemoryStick, color: '#8B5CF6' },
  { name: 'Storage', value: 28, icon: HardDrive, color: '#10B981' },
]

export function SystemResources() {
  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="mb-4">
        <h3 className="text-white font-bold text-sm">SYSTEM RESOURCES</h3>
        <p className="text-gray-500 text-xs mt-0.5">Live infrastructure status</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {resources.map((resource) => {
          const Icon = resource.icon
          const circumference = 2 * Math.PI * 35
          const offset = circumference - (resource.value / 100) * circumference

          return (
            <div key={resource.name} className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.1)"
                    strokeWidth="6"
                  />
                  {/* Progress */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={resource.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                      filter: `drop-shadow(0 0 6px ${resource.color})`,
                      transition: 'stroke-dashoffset 1s ease',
                    }}
                  />
                </svg>
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Icon size={14} style={{ color: resource.color }} />
                  <span className="text-white font-bold text-sm mt-0.5">{resource.value}%</span>
                </div>
              </div>
              <div className="text-gray-400 text-[10px] font-medium">{resource.name}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
