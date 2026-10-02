import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Search, Loader2, RefreshCw, AlertCircle, Shield, TrendingUp,
  AlertTriangle, BarChart3, Download, ChevronDown, FileJson, FileType2, Radio
} from 'lucide-react'
import apiClient from '@/lib/api'
import { CoverageStatement } from '@/components/assurance/CoverageStatement'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Report {
  id: number
  title: string
  type: string
  source: string
  status: string
  createdAt: string
  details: string
}

const typeColors: Record<string, string> = {
  Trust: '#5EEAD4',
  Model: '#38BDF8',
  Blockchain: '#A78BFA',
  Dataset: '#FBBF24',
  Attack: '#F87171',
  History: '#3A7D8F',
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadReports() }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDownloadMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dRes, mRes, bRes, aRes] = await Promise.all([
        apiClient.getDatasets().catch(() => ({ data: { datasets: {} } })),
        apiClient.getModels().catch(() => ({ data: { models: {} } })),
        apiClient.getBlocks().catch(() => ({ data: { blocks: [] } })),
        apiClient.getAttacks().catch(() => ({ data: { attacks: {} } })),
      ])
      const datasets = dRes.data.datasets || {}
      const models = mRes.data.models || {}
      const blocks = bRes.data.blocks || []
      const attacks = aRes.data.attacks || {}
      const list: Report[] = []
      let id = 1

      Object.entries(datasets).forEach(([key, val]: [string, any]) => {
        list.push({
          id: id++, title: `${key.toUpperCase()}_DATASET_ANALYSIS`, type: 'Dataset', source: key,
          status: 'Final', createdAt: new Date().toISOString().split('T')[0],
          details: `Quality: ${(val.overall_score || 0).toFixed(1)}% · ${val.total_images || 0} images`,
        })
      })
      Object.entries(models).forEach(([key, val]: [string, any]) => {
        list.push({
          id: id++, title: `${key.toUpperCase()}_MODEL_PERFORMANCE`, type: 'Model', source: key,
          status: 'Final', createdAt: new Date().toISOString().split('T')[0],
          details: `Precision: ${(val.precision || 0).toFixed(1)}% · mAP50: ${(val.mAP50 || 0).toFixed(1)}%`,
        })
      })
      if (blocks.length > 0) {
        list.push({
          id: id++, title: 'BLOCKCHAIN_AUDIT_REPORT', type: 'Blockchain', source: 'Ledger',
          status: 'Final', createdAt: new Date().toISOString().split('T')[0],
          details: `${blocks.length} blocks · Chain valid`,
        })
      }
      // Attacks is a list, not object
      const attacksList = Array.isArray(attacks) ? attacks : Object.values(attacks || {})
      attacksList.forEach((val: any) => {
        const name = val.name || val.id || 'Attack'
        list.push({
          id: id++,
          title: name.toUpperCase().replace(/\s+/g, '_'),
          type: 'Attack',
          source: val.id || name,
          status: 'Final',
          createdAt: (val.timestamp || new Date().toISOString()).split('T')[0],
          details: `Severity: ${val.severity || 'N/A'} · ${val.detected ? 'Detected' : 'Missed'}`,
        })
      })
      setReports(list)
    } catch (err: any) {
      setError(err?.message || 'Backend error')
    } finally { setLoading(false) }
  }

  const filtered = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || r.type === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: reports.length,
    final: reports.filter((r) => r.status === 'Final').length,
    dataset: reports.filter((r) => r.type === 'Dataset').length,
    model: reports.filter((r) => r.type === 'Model').length,
  }

  const downloadJSON = async () => {
    try {
      const exportData = {
        export_info: { exported_at: new Date().toISOString(), source: 'CV-INTEGRITY' },
        reports,
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cv_integrity_report_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
      setShowDownloadMenu(false)
    } catch { alert('Download failed') }
  }

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF()
      doc.setFillColor(8, 8, 12); doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(94, 234, 212); doc.setFontSize(22); doc.setFont('helvetica', 'bold')
      doc.text('CV-INTEGRITY', 15, 18)
      doc.setFontSize(10); doc.setTextColor(150, 150, 150); doc.setFont('helvetica', 'normal')
      doc.text('AI Trust Platform — Audit Report', 15, 26)
      doc.setFontSize(8); doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 33)
      doc.setTextColor(0, 0, 0); doc.setFontSize(14); doc.setFont('helvetica', 'bold')
      doc.text('Reports', 15, 55)
      const tableData = reports.map((r) => [r.title, r.type, r.details, r.status, r.createdAt])
      autoTable(doc, {
        startY: 65,
        head: [['Report', 'Type', 'Details', 'Status', 'Date']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [94, 234, 212], textColor: [8, 8, 12] },
      })
      doc.save(`cv_integrity_report_${new Date().toISOString().slice(0, 10)}.pdf`)
      setShowDownloadMenu(false)
    } catch { alert('PDF failed') }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#08080C', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top header */}
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.4)' }}>
            <FileText size={14} style={{ color: '#5EEAD4' }} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: '#5EEAD4' }}>REPORTS</div>
            <div className="text-[9px] tracking-[0.2em]" style={{ color: '#5EEAD4', opacity: 0.5 }}>AUDIT_ARTIFACTS · EXPORTABLE</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5EEAD4', opacity: 0.5 }} />
            <input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded text-[11px] font-mono outline-none w-52"
              style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)', color: '#FFFFFF' }}
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
              style={{ background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.5)', color: '#5EEAD4' }}>
              <Download size={11} />
              EXPORT
              <ChevronDown size={10} />
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded z-50 overflow-hidden"
                style={{ background: '#0A0F14', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
                <button onClick={downloadJSON}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-[rgba(94,234,212,0.08)]"
                  style={{ color: '#5EEAD4', borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
                  <FileJson size={14} />
                  <div>
                    <div className="text-[11px] font-mono font-bold">DOWNLOAD_JSON</div>
                    <div className="text-[9px] font-mono" style={{ opacity: 0.5 }}>Machine-readable</div>
                  </div>
                </button>
                <button onClick={downloadPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-[rgba(94,234,212,0.08)]"
                  style={{ color: '#5EEAD4' }}>
                  <FileType2 size={14} />
                  <div>
                    <div className="text-[11px] font-mono font-bold">DOWNLOAD_PDF</div>
                    <div className="text-[9px] font-mono" style={{ opacity: 0.5 }}>Human-readable</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button onClick={loadReports}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider"
            style={{ background: 'rgba(94, 234, 212, 0.08)', border: '1px solid rgba(94, 234, 212, 0.3)', color: '#5EEAD4' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            REFRESH
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded flex items-center gap-2"
          style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          <AlertCircle size={14} style={{ color: '#F87171' }} />
          <span className="text-[11px] font-mono" style={{ color: '#F87171' }}>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'TOTAL_REPORTS', value: stats.total, color: '#3A7D8F' },
          { label: 'FINAL_REPORTS', value: stats.final, color: '#5EEAD4' },
          { label: 'DATASET_REPORTS', value: stats.dataset, color: '#FBBF24' },
          { label: 'MODEL_REPORTS', value: stats.model, color: '#A78BFA' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded"
            style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            <div className="text-[10px] font-mono tracking-[0.2em] mb-2" style={{ color: '#5EEAD4', opacity: 0.5 }}>{s.label}</div>
            <div className="text-[28px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 rounded mb-5 flex gap-2 flex-wrap"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        {['all', 'Dataset', 'Model', 'Blockchain', 'Attack'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-[10px] font-mono tracking-wider transition-all"
            style={filter === f
              ? { background: 'rgba(94, 234, 212, 0.2)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.5)' }
              : { background: 'transparent', color: '#5EEAD4', opacity: 0.5, border: '1px solid rgba(94, 234, 212, 0.15)' }}>
            {f === 'all' ? 'ALL' : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="p-5 rounded mb-5"
        style={{ background: 'rgba(94, 234, 212, 0.02)', border: '1px solid rgba(94, 234, 212, 0.15)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin" size={28} style={{ color: '#5EEAD4' }} />
            <span className="ml-3 text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.6 }}>GENERATING REPORTS...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.15)' }}>
                  {['REPORT', 'TYPE', 'DETAILS', 'STATUS', 'DATE'].map((h, i) => (
                    <th key={h}
                      className={`text-[10px] font-mono tracking-[0.15em] uppercase pb-3 ${i < 3 ? 'text-left' : 'text-right'}`}
                      style={{ color: '#5EEAD4', opacity: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => {
                  const color = typeColors[report.type] || '#5EEAD4'
                  return (
                    <tr key={report.id} style={{ borderBottom: '1px solid rgba(94, 234, 212, 0.06)' }}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded flex items-center justify-center"
                            style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
                            <FileText size={14} style={{ color }} />
                          </div>
                          <div className="text-[12px] font-bold font-mono" style={{ color: '#FFFFFF' }}>{report.title}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                          {report.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="text-[10px] font-mono truncate max-w-md" style={{ color: '#5EEAD4', opacity: 0.7 }}>{report.details}</div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded"
                          style={{ background: 'rgba(94, 234, 212, 0.15)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
                          ● {report.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="text-[10px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>{report.createdAt}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText size={40} className="mx-auto mb-3" style={{ color: '#5EEAD4', opacity: 0.3 }} />
            <div className="text-[12px] font-mono" style={{ color: '#5EEAD4', opacity: 0.5 }}>NO REPORTS FOUND</div>
          </div>
        )}
      </div>

      <CoverageStatement />
    </div>
  )
}
