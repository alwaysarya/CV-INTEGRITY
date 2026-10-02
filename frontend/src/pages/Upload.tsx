import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload as UploadIcon, FileText, CheckCircle, Loader2, X, Hash, Lock, Database, ArrowRight, Activity } from 'lucide-react'
import axios from 'axios'
import { notify } from '@/lib/toast'

const API = 'http://localhost:8000'

interface UploadedFile {
  file_name: string
  file_hash: string
  size_mb: number
  block_index?: number
}

export function Upload() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const arr = Array.from(newFiles)
    setFiles((prev) => [...prev, ...arr])
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const uploadAll = async () => {
    if (files.length === 0) return
    setUploading(true)
    setResults([])
    const uploaded: UploadedFile[] = []
    
    for (const file of files) {
      try {
        notify.info(`Uploading ${file.name}...`, 'Computing SHA-256 hash')
        const formData = new FormData()
        formData.append('file', file)
        
        const res = await axios.post(`${API}/api/upload/file`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        })
        
        if (res.data.status === 'success') {
          uploaded.push(res.data)
          notify.success('Uploaded!', `${file.name} • Block #${res.data.block_index || 'N/A'}`)
        }
      } catch (err: any) {
        notify.error(`Failed: ${file.name}`, err.message)
      }
    }
    
    setResults(uploaded)
    setFiles([])
    setUploading(false)
  }

  // Get latest upload for Notary Receipt
  const latest = results[0]
  
  // Mock registry data (would come from backend in production)
  const registry = results.map((r) => ({
    filename: r.file_name,
    hash: r.file_hash,
    size: `${r.size_mb.toFixed(3)} MB`,
    block: `#${r.block_index || 'N/A'}`,
    status: 'CHAIN_CONFIRMED',
  }))

  return (
    <div className="space-y-6 p-6" style={{ background: '#F5F5F0', minHeight: 'calc(100vh - 72px)' }}>
      {/* ============================================ */}
      {/* NAYA CONTENT — File Upload & Blockchain Notary */}
      {/* ============================================ */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#1A1A14] mb-1">File Upload & Blockchain Notary</h1>
          <p className="text-[#6B6B60] text-sm">
            Every uploaded model or dataset file is cryptographically hashed with SHA-256 and minted into a new blockchain block.
          </p>
        </div>

        {/* Upload Zone */}
        <Card
          className="rounded-3xl p-12 text-center mb-6"
          style={{
            border: dragOver ? '2px dashed #38BDF8' : '2px dashed rgba(56, 189, 248, 0.3)',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setDragOver(true)}
          onMouseLeave={() => setDragOver(false)}
        >
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFiles(e.dataTransfer.files)
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              accept=".pt,.pth,.onnx,.yaml,.yml,.jpg,.jpeg,.png,.zip,.tar,.gz"
            />
            
            <motion.div
              animate={{ scale: dragOver ? 1.05 : 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center">
                <UploadIcon size={40} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-[#1A1A14] font-bold text-lg mb-1">
                  {dragOver ? 'Drop file here' : 'Click to select or drag and drop a file'}
                </div>
                <div className="text-[#6B6B60] text-xs">
                  Supports: PyTorch (.pt), ONNX (.onnx), YOLO YAML, Images (.jpg, .png), ZIP
                </div>
              </div>
            </motion.div>
          </div>
        </Card>

        {/* Files to Upload */}
        {files.length > 0 && (
          <Card className="rounded-3xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1A1A14] font-bold text-sm">FILES TO UPLOAD ({files.length})</h3>
              <button
                onClick={uploadAll}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-[#1A1A14] text-sm font-medium disabled:opacity-50"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadIcon size={16} />}
                {uploading ? 'Uploading...' : 'Upload All'}
              </button>
            </div>
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#F5F5F0] border border-cyan-500/10">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-cyan-400" />
                    <div>
                      <div className="text-[#1A1A14] text-xs font-bold">{file.name}</div>
                      <div className="text-[#8B8B80] text-[10px]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <button onClick={() => removeFile(i)} disabled={uploading} className="text-[#8B8B80] hover:text-red-400">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Cryptographic Notary Receipt */}
        {latest && (
          <Card className="rounded-3xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-green-400" />
              <h3 className="text-[#1A1A14] font-bold text-sm">Cryptographic Notary Receipt</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-[#8B8B80] text-[10px] uppercase tracking-wider mb-1">Filename</div>
                <div className="text-[#1A1A14] text-sm font-bold">{latest.file_name}</div>
              </div>
              <div>
                <div className="text-[#8B8B80] text-[10px] uppercase tracking-wider mb-1">Blockchain Block</div>
                <div className="text-cyan-400 text-sm font-bold">Block #{latest.block_index || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[#8B8B80] text-[10px] uppercase tracking-wider mb-1">File Size</div>
                <div className="text-[#1A1A14] text-sm font-bold">{latest.size_mb.toFixed(3)} MB</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#F5F5F0] border border-cyan-500/10">
              <div className="flex items-center gap-2 mb-1">
                <Hash size={10} className="text-cyan-400" />
                <span className="text-[#8B8B80] text-[9px] uppercase tracking-wider">SHA-256 Digest</span>
              </div>
              <div className="text-cyan-400 text-[10px] font-mono break-all">{latest.file_hash}</div>
            </div>
          </Card>
        )}

        {/* Anchored File Registry */}
        {registry.length > 0 && (
          <Card className="rounded-3xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-cyan-400" />
                <h3 className="text-[#1A1A14] font-bold text-sm">Anchored File Registry</h3>
              </div>
              <span className="text-[#8B8B80] text-[10px]">{registry.length} files notarized</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/10">
                    <th className="text-left text-[#8B8B80] text-[9px] font-bold tracking-wider uppercase pb-3">Filename</th>
                    <th className="text-left text-[#8B8B80] text-[9px] font-bold tracking-wider uppercase pb-3">SHA-256 Hash</th>
                    <th className="text-right text-[#8B8B80] text-[9px] font-bold tracking-wider uppercase pb-3">Size</th>
                    <th className="text-right text-[#8B8B80] text-[9px] font-bold tracking-wider uppercase pb-3">Block #</th>
                    <th className="text-right text-[#8B8B80] text-[9px] font-bold tracking-wider uppercase pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registry.map((r, i) => (
                    <tr key={i} className="border-b border-cyan-500/5">
                      <td className="py-3"><span className="text-[#1A1A14] text-xs font-bold">{r.filename}</span></td>
                      <td className="py-3"><span className="text-cyan-400 text-[10px] font-mono">{r.hash.substring(0, 50)}...</span></td>
                      <td className="py-3 text-right"><span className="text-[#1A1A14] text-xs font-mono">{r.size}</span></td>
                      <td className="py-3 text-right"><span className="text-cyan-400 text-xs font-mono">{r.block}</span></td>
                      <td className="py-3 text-right">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-[9px] gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Analyze Button */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="rounded-3xl p-6" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(139,92,246,0.08))' }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                    <Activity size={24} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[#1A1A14] font-bold text-base">Ready for Analysis</div>
                    <div className="text-[#6B6B60] text-xs">
                      {results.length} file{results.length > 1 ? 's' : ''} uploaded & anchored to blockchain
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/dataset-analysis?file=${encodeURIComponent(results[0].file_name)}`)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-[#1A1A14] text-sm font-medium hover:opacity-90 transition-all"
                >
                  Analyze This Dataset
                  <ArrowRight size={16} />
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* ============================================ */}
      {/* PURANA CONTENT — WAISE HI RAHEGA */}
      {/* ============================================ */}
      <div className="border-t border-cyan-500/20 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-[#1A1A14] mb-1">Upload Dataset</h2>
          <p className="text-[#6B6B60] text-sm">
            Upload files with automatic SHA-256 hashing and blockchain recording
          </p>
        </motion.div>

        {/* Drop zone (old) */}
        <Card
          className="rounded-3xl p-12 text-center mb-6"
          style={{
            border: dragOver ? '2px dashed #38BDF8' : '2px dashed rgba(56, 189, 248, 0.3)',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setDragOver(true)}
          onMouseLeave={() => setDragOver(false)}
        >
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFiles(e.dataTransfer.files)
            }}
          >
            <motion.div
              animate={{ scale: dragOver ? 1.1 : 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center">
                <UploadIcon size={40} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-[#1A1A14] font-bold text-lg mb-1">
                  {dragOver ? 'Drop files here' : 'Click or drag files to upload'}
                </div>
                <div className="text-[#6B6B60] text-sm">
                  Supported: ZIP, TAR, GZ, JPG, PNG, MP4, AVI • Max 500 MB
                </div>
              </div>
            </motion.div>
          </div>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-green-400" />
              <h3 className="text-[#1A1A14] font-bold text-sm">UPLOADED SUCCESSFULLY</h3>
            </div>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-green-500/5 border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[#1A1A14] text-xs font-bold">{r.file_name}</div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-[10px]">
                      {r.size_mb} MB
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <Hash size={10} className="text-cyan-400" />
                    <span className="text-cyan-400 font-mono">{r.file_hash.substring(0, 32)}...</span>
                  </div>
                  {r.block_index !== undefined && r.block_index !== null && (
                    <div className="mt-1 text-[10px] text-green-400">
                      ⛓️ Recorded in Block #{r.block_index}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}