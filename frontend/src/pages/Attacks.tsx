import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Play, CheckCircle, XCircle, Activity, Target, Bug } from 'lucide-react'

interface Attack {
  id: string
  name: string
  description: string
  severity: 'Critical' | 'High' | 'Medium'
  category: 'Poisoning' | 'Evasion' | 'Inversion' | 'Backdoor'
  successRate: number
  detections: number
}

const attacks: Attack[] = [
  { id: 'poison-1', name: 'Data Poisoning', description: 'Inject malicious samples into training data', severity: 'Critical', category: 'Poisoning', successRate: 12, detections: 145 },
  { id: 'evasion-1', name: 'Adversarial Evasion', description: 'Craft inputs to fool model predictions', severity: 'High', category: 'Evasion', successRate: 28, detections: 89 },
  { id: 'inversion-1', name: 'Model Inversion', description: 'Extract training data from model outputs', severity: 'High', category: 'Inversion', successRate: 8, detections: 34 },
  { id: 'backdoor-1', name: 'Backdoor Injection', description: 'Embed hidden triggers in model', severity: 'Critical', category: 'Backdoor', successRate: 5, detections: 67 },
  { id: 'poison-2', name: 'Label Flipping', description: 'Corrupt training labels', severity: 'Medium', category: 'Poisoning', successRate: 18, detections: 112 },
  { id: 'evasion-2', name: 'FGSM Attack', description: 'Fast gradient sign method', severity: 'Medium', category: 'Evasion', successRate: 22, detections: 156 },
]

const severityColors = {
  Critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  High: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Medium: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
}

export function Attacks() {
  const [selectedAttack, setSelectedAttack] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{ detected: boolean; confidence: number } | null>(null)

  const runAttack = (attackId: string) => {
    setSelectedAttack(attackId)
    setIsRunning(true)
    setResult(null)

    setTimeout(() => {
      setIsRunning(false)
      setResult({
        detected: Math.random() > 0.3,
        confidence: Math.round(85 + Math.random() * 12),
      })
    }, 2000)
  }

  const stats = {
    total: attacks.length,
    critical: attacks.filter((a) => a.severity === 'Critical').length,
    totalDetections: attacks.reduce((sum, a) => sum + a.detections, 0),
    blockRate: 94,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Attack Simulator</h1>
          <p className="text-gray-400 text-sm">Test your defenses against adversarial attacks</p>
        </div>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/40 gap-1.5 py-2 px-3">
          <Bug size={12} />
          Sandbox Mode
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attacks', value: stats.total, color: '#38BDF8', icon: Bug },
          { label: 'Critical', value: stats.critical, color: '#EF4444', icon: AlertTriangle },
          { label: 'Total Detections', value: stats.totalDetections, color: '#10B981', icon: Target },
          { label: 'Block Rate', value: `${stats.blockRate}%`, color: '#38BDF8', icon: Shield },
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

      {result && (
        <Card className="glass-card p-5" style={{
          background: result.detected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          borderColor: result.detected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
          border: '1px solid',
        }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
              backgroundColor: result.detected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: result.detected ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(239, 68, 68, 0.5)',
            }}>
              {result.detected ? <CheckCircle size={24} className="text-green-400" /> : <XCircle size={24} className="text-red-400" />}
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-lg">
                {result.detected ? '✓ Attack Detected & Blocked' : '⚠ Attack Succeeded'}
              </div>
              <div className="text-gray-400 text-xs mt-0.5">
                Detection confidence: <span className="font-bold" style={{ color: result.detected ? '#10B981' : '#EF4444' }}>{result.confidence}%</span>
              </div>
            </div>
            <button onClick={() => setResult(null)} className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
              Reset
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attacks.map((attack) => {
          const colors = severityColors[attack.severity]
          const running = isRunning && selectedAttack === attack.id

          return (
            <Card key={attack.id} className="glass-card border-cyan-500/20 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                  <Bug size={18} style={{ color: colors.text }} />
                </div>
                <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                  {attack.severity}
                </Badge>
              </div>

              <h3 className="text-white font-bold text-sm mb-1">{attack.name}</h3>
              <p className="text-gray-400 text-xs mb-4">{attack.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 rounded-lg bg-black/30 border border-cyan-500/10">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider">Success</div>
                  <div className="text-red-400 text-sm font-bold">{attack.successRate}%</div>
                </div>
                <div className="p-2 rounded-lg bg-black/30 border border-cyan-500/10">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider">Detected</div>
                  <div className="text-green-400 text-sm font-bold">{attack.detections}</div>
                </div>
              </div>

              <button
                onClick={() => runAttack(attack.id)}
                disabled={running}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  running ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 cursor-wait' : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/30'
                }`}
              >
                {running ? (<><Activity size={12} className="animate-spin" />Running...</>) : (<><Play size={12} />Run Attack</>)}
              </button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
