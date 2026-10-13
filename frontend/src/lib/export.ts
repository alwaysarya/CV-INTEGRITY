/**
 * Export Utility
 * Download data as CSV, JSON, or PDF-ready format
 */

export interface ExportOptions {
  filename?: string
  format?: 'csv' | 'json'
}

/**
 * Convert array of objects to CSV string
 */
export function toCSV(data: any[], columns?: string[]): string {
  if (!data || data.length === 0) return ''

  // Determine columns
  const cols = columns || Object.keys(data[0] || {})

  // Escape CSV values
  const escape = (val: any): string => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // Header row
  const header = cols.map(escape).join(',')

  // Data rows
  const rows = data.map(row =>
    cols.map(col => {
      const val = col.split('.').reduce((obj, key) => obj?.[key], row)
      return escape(val)
    }).join(',')
  )

  return [header, ...rows].join('\n')
}

/**
 * Download a string as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
  const blob = new Blob(['\ufeff' + content], { type: `${mimeType};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate a filename with today's date
 */
export function datedFilename(base: string, ext: string): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '-')
  return `${base}_${date}_${time}.${ext}`
}

/**
 * Export array of objects as CSV
 */
export function exportCSV(data: any[], baseName: string, columns?: string[]): void {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }
  const csv = toCSV(data, columns)
  const filename = datedFilename(baseName, 'csv')
  downloadFile(csv, filename, 'text/csv')
}

/**
 * Export array of objects as JSON
 */
export function exportJSON(data: any[], baseName: string): void {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }
  const json = JSON.stringify(data, null, 2)
  const filename = datedFilename(baseName, 'json')
  downloadFile(json, filename, 'application/json')
}

/**
 * Export as both CSV and JSON — triggers two downloads
 */
export function exportBoth(data: any[], baseName: string, columns?: string[]): void {
  exportCSV(data, baseName, columns)
  setTimeout(() => exportJSON(data, baseName), 300)
}
