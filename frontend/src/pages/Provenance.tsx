import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, ShieldCheck, Hash, CheckCircle, AlertTriangle, Upload,
  Key, Fingerprint, FileImage, Link as LinkIcon, XCircle, Eye
} from 'lucide-react'

const API = 'http://localhost:8000'

const truncate = (s: string, n = 24) => s ? s.substring(0, n) + '...' : '—'

export function Provenance() {
  const [file, setFile] = useState<File | null>(null)
  const [modelName, setModelName] = useState('good')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [tamperResult, setTamperResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runInference = async () => {
    if (!file) return
    setLoading(true); setError(null); setResult(null); setVerifyResult(null); setTamperResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API}/api/provenance/infer?model_name=${modelName}`, {
        method: 'POST', body: formData,
      })
      const data = await res.json()
      if (data.status === 'success') setResult(data)
      else setError(data.detail || 'Inference failed')
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const verifyBinding = async () => {
    if (!result) return
    try {
      const res = await fetch(`${API}/api/provenance/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.provenance),
      })
      const data = await res.json()
      setVerifyResult(data.verification)
    } catch (err: any) { setError(err.message) }
  }

  const tamperTest = async () => {
    if (!result) return
    const tampered = { ...result.provenance, output_hash: '0' + result.provenance.output_hash.substring(1) }
    try {
      const res = await fetch(`${API}/api/provenance/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tampered),
      })
      const data = await res.json()
      setTamperResult(data.verification)
    } catch (err: any) { setError(err.message) }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setResult(null)
      setVerifyResult(null)
      setTamperResult(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              CV-INTEGRITY / Provenance
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
              Inference Provenance
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Cryptographic binding of input → model → config → output with tamper detection.
            </p>
          </div>
        </div>

        {/* Input section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4">
              <div className="text-[14px] font-semibold text-slate-900">Input Image</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Upload an image to run inference and generate a cryptographic provenance record
              </div>
            </div>

            <label className="block cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                file ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/30'
              }`}>
                {file ? (
                  <>
                    <FileImage size={32} className="text-emerald-600" />
                    <div className="mt-3 text-[13px] font-medium text-slate-800">{file.name}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB · Click to change
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="text-slate-400" />
                    <div className="mt-3 text-[13px] font-medium text-slate-700">Click to upload image</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">PNG, JPG, or WEBP</div>
                  </>
                )}
              </div>
            </label>

            {/* Model selector */}
            <div className="mt-5">
              <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Model</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="good">good</option>
                <option value="bad">bad</option>
                <option value="worst">worst</option>
              </select>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={runInference}
                disabled={!file || loading}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Fingerprint size={13} />}
                {loading ? 'Running...' : 'Run Inference'}
              </button>
              <button
                onClick={verifyBinding}
                disabled={!result}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck size={13} />
                Verify Binding
              </button>
              <button
                onClick={tamperTest}
                disabled={!result}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <AlertTriangle size={13} />
                Tamper Test
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <div className="text-[12px] font-medium text-red-700">{error}</div>
              </div>
            )}
          </div>

          {/* Verification status */}
          <div className="space-y-4">
            {verifyResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-5 shadow-sm ${
                  verifyResult.valid ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {verifyResult.valid ? (
                    <CheckCircle size={24} className="text-emerald-600" />
                  ) : (
                    <XCircle size={24} className="text-red-600" />
                  )}
                  <div>
                    <div className={`text-[14px] font-semibold ${verifyResult.valid ? 'text-emerald-900' : 'text-red-900'}`}>
                      {verifyResult.valid ? 'Binding Verified' : 'Binding Invalid'}
                    </div>
                    <div className={`mt-0.5 text-[11px] ${verifyResult.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                      {verifyResult.valid ? 'Cryptographic chain is intact' : 'Tampering detected'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tamperResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-5 shadow-sm ${
                  !tamperResult.valid ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {!tamperResult.valid ? (
                    <ShieldCheck size={24} className="text-emerald-600" />
                  ) : (
                    <AlertTriangle size={24} className="text-amber-600" />
                  )}
                  <div>
                    <div className={`text-[14px] font-semibold ${!tamperResult.valid ? 'text-emerald-900' : 'text-amber-900'}`}>
                      {!tamperResult.valid ? 'Tamper Detected' : 'Not Detected'}
                    </div>
                    <div className={`mt-0.5 text-[11px] ${!tamperResult.valid ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {!tamperResult.valid ? 'System correctly rejected tampered binding' : 'Warning: Tampering was not detected'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {result && !verifyResult && !tamperResult && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <LinkIcon size={20} className="text-slate-400" />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-800">Ready to verify</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">Run verify or tamper test</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Provenance chain */}
        {result?.provenance && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <Hash size={14} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900">Provenance Chain</div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  Cryptographic binding of input, model, config and output
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(result.provenance).map(([key, val]: [string, any]) => (
                <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <Key size={11} className="text-slate-400" />
                  </div>
                  <div className="mt-1.5 break-all font-mono text-[11px] text-slate-700">
                    {typeof val === 'string' && val.length > 40 ? truncate(val, 48) : String(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detections */}
        {result?.detections && result.detections.length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Eye size={14} className="text-blue-600" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-900">Detections</div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {result.detections.length} objects detected in this inference
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {result.detections.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[12px] font-medium capitalize text-slate-800">
                      {d.class || 'Object'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-emerald-700">
                    {((d.confidence || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Provenance
