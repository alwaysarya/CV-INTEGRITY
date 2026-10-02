import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, XCircle, FileText, Lock, Eye } from 'lucide-react'

interface CoverageStatementProps {
  compact?: boolean
}

export function CoverageStatement({ compact = false }: CoverageStatementProps) {
  const supported = [
    'Trigger injection (backdoor)',
    'Label flipping',
    'Near-duplicate flooding',
    'Out-of-distribution insertion',
    'Model substitution',
    'Weight tampering',
    'Inference record replay',
  ]

  const partial = [
    { name: 'Systematic mislabelling', confidence: '80%' },
    { name: 'Clean-label poisoning', confidence: '60%' },
  ]

  const notSupported = [
    'Physical adversarial patches',
    'Hardware-level backdoors',
    'Supply chain attacks (beyond model hash)',
  ]

  const assumptions = [
    'White-box access for parameter checks (with black-box fallback)',
    'COCO / YOLO dataset formats supported',
    'ONNX / PyTorch model formats supported',
    'Reference baseline available for comparison',
  ]

  const limitations = [
    'Confidence reduces with smaller datasets (< 100 samples)',
    'No support for encrypted or obfuscated models',
    'Drift detection requires declared reference distribution',
    'Adversarial testing limited to FGSM/PGD attacks',
  ]

  if (compact) {
    return (
      <Card className="liquid-glass specular border-0 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-cyan-400" />
          <h3 className="text-white font-bold text-sm">Coverage Statement</h3>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[10px]">
            PS 2.2.5
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-green-400 text-xs font-bold">Supported ({supported.length})</span>
            </div>
            <ul className="text-gray-400 text-[11px] space-y-1">
              {supported.slice(0, 3).map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
              {supported.length > 3 && (
                <li className="text-cyan-400">+ {supported.length - 3} more</li>
              )}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold">Partial ({partial.length})</span>
            </div>
            <ul className="text-gray-400 text-[11px] space-y-1">
              {partial.map((p, i) => (
                <li key={i}>• {p.name} ({p.confidence})</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={14} className="text-red-400" />
              <span className="text-red-400 text-xs font-bold">Not Supported ({notSupported.length})</span>
            </div>
            <ul className="text-gray-400 text-[11px] space-y-1">
              {notSupported.slice(0, 3).map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="liquid-glass specular border-0 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
          <FileText size={20} className="text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">Coverage Statement</h3>
          <p className="text-gray-400 text-xs">What this system can and cannot detect</p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[10px] ml-auto">
          PS 2.2.5
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supported */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-green-400 text-sm font-bold">Supported Attack Classes</span>
          </div>
          <ul className="space-y-1.5">
            {supported.map((s, i) => (
              <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Partial */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-yellow-400" />
            <span className="text-yellow-400 text-sm font-bold">Partially Supported</span>
          </div>
          <ul className="space-y-1.5">
            {partial.map((p, i) => (
              <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">⚠</span>
                <span>{p.name} <span className="text-gray-500">({p.confidence} confidence)</span></span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 mb-3 mt-5">
            <XCircle size={16} className="text-red-400" />
            <span className="text-red-400 text-sm font-bold">Not Supported</span>
          </div>
          <ul className="space-y-1.5">
            {notSupported.map((s, i) => (
              <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-cyan-500/10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assumptions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Eye size={14} className="text-cyan-400" />
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Assumptions</span>
          </div>
          <ul className="space-y-1">
            {assumptions.map((a, i) => (
              <li key={i} className="text-gray-400 text-[11px]">• {a}</li>
            ))}
          </ul>
        </div>

        {/* Limitations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock size={14} className="text-orange-400" />
            <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">Known Limitations</span>
          </div>
          <ul className="space-y-1">
            {limitations.map((l, i) => (
              <li key={i} className="text-gray-400 text-[11px]">• {l}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
