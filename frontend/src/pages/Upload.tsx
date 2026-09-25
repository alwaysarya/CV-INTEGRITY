import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload as UploadIcon, FileText, CheckCircle, Loader2, X, Hash } from 'lucide-react'
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold gradient-text mb-1">Upload Dataset</h1>
        <p className="text-gray-400 text-sm">
          Upload files with automatic SHA-256 hashing and blockchain recording
        </p>
      </motion.div>

      {/* Drop zone */}
      <Card
        className="liquid-glass border-0 p-12 text-center"
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
            accept=".zip,.tar,.gz,.jpg,.jpeg,.png,.mp4,.avi"
          />
          
          <motion.div
            animate={{ scale: dragOver ? 1.1 : 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center">
              <UploadIcon size={40} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-white font-bold text-lg mb-1">
                {dragOver ? 'Drop files here' : 'Click or drag files to upload'}
              </div>
              <div className="text-gray-400 text-sm">
                Supported: ZIP, TAR, GZ, JPG, PNG, MP4, AVI • Max 500 MB
              </div>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* File list */}
      {files.length > 0 && (
        <Card className="liquid-glass border-0 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm">
              FILES TO UPLOAD ({files.length})
            </h3>
            <button
              onClick={uploadAll}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium disabled:opacity-50 hover-scale"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadIcon size={16} />}
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-cyan-500/10">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-cyan-400" />
                  <div>
                    <div className="text-white text-xs font-bold">{file.name}</div>
                    <div className="text-gray-500 text-[10px]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  disabled={uploading}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card className="liquid-glass border-0 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-green-400" />
            <h3 className="text-white font-bold text-sm">UPLOADED SUCCESSFULLY</h3>
          </div>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-green-500/5 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white text-xs font-bold">{r.file_name}</div>
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
  )
}
