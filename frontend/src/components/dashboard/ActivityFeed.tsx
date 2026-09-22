import { Card } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Zap, UserPlus, Shield, Database } from 'lucide-react'

interface Activity {
  id: number
  icon: any
  text: string
  time: string
  color: string
}

const activities: Activity[] = [
  { id: 1, icon: Database, text: "Dataset 'Drone-Detection' verified", time: '2 min ago', color: '#10B981' },
  { id: 2, icon: Zap, text: "Model 'YOLOv8n' deployed", time: '14 min ago', color: '#38BDF8' },
  { id: 3, icon: UserPlus, text: "New user 'Priya Sharma' joined", time: '28 min ago', color: '#8B5CF6' },
  { id: 4, icon: AlertCircle, text: "Suspicious activity detected (CAM-04)", time: '42 min ago', color: '#EF4444' },
  { id: 5, icon: Shield, text: "Blockchain block #006 mined", time: '1 hr ago', color: '#10B981' },
  { id: 6, icon: CheckCircle, text: "COCO-2017 integrity check passed", time: '2 hr ago', color: '#10B981' },
]

export function ActivityFeed() {
  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm">RECENT ACTIVITY</h3>
          <p className="text-gray-500 text-xs mt-0.5">Latest actions across the platform</p>
        </div>
        <button className="text-cyan-400 text-xs hover:text-cyan-300">View Logs →</button>
      </div>

      <div className="space-y-2">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div
              key={activity.id}
              className="group flex items-center gap-3 p-2.5 rounded-lg transition-all hover:translate-x-1"
              style={{ borderLeft: `2px solid ${activity.color}`, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${activity.color}15`, border: `1px solid ${activity.color}40` }}
              >
                <Icon size={12} style={{ color: activity.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-300 text-xs truncate">{activity.text}</div>
              </div>
              <div className="text-gray-500 text-[10px] flex-shrink-0">{activity.time}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
