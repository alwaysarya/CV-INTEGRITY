import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

export const apiClient = {
  // Original
  getRoot: () => api.get('/'),
  getHealth: () => api.get('/health'),
  getDatasets: () => api.get('/api/datasets'),
  getDataset: (name: string) => api.get(`/api/datasets/${name}`),
  getModels: () => api.get('/api/models'),
  getTrustScores: () => api.get('/api/trust-scores'),
  getTrustScore: (name: string) => api.get(`/api/trust-scores/${name}`),
  getBlockchain: () => api.get('/api/blockchain'),
  getBlocks: () => api.get('/api/blockchain/blocks'),
  getBlock: (index: number) => api.get(`/api/blockchain/block/${index}`),
  getWallets: () => api.get('/api/wallets'),
  getWallet: (owner: string) => api.get(`/api/wallets/${owner}`),
  getAttacks: () => api.get('/api/attacks'),
  getTamperDetection: () => api.get('/api/tamper-detection'),
  getContracts: () => api.get('/api/contracts'),
  verifyIntegrity: (data: any) => api.post('/api/verify', data),
  getStats: () => api.get('/api/stats'),

  // New Premium Endpoints
  getModelFingerprints: () => api.get('/api/model/fingerprints'),
  getModelFingerprint: (modelPath: string) =>
    api.post('/api/model/fingerprint', { model_path: modelPath }),
  xaiExplain: (data: any) => api.post('/api/xai/explain', data),
  backdoorDetect: (data: any) => api.post('/api/backdoor/detect', data),
  sourceRiskAnalyze: (contributors: any[]) =>
    api.post('/api/source-risk/analyze', { contributors }),
  loadDataset: (datasetPath: string) =>
    api.post('/api/dataset/load', { dataset_path: datasetPath }),
  getAvailableDatasets: () => api.get('/api/dataset/available'),
  getAssuranceReport: () => api.get('/api/assurance/report'),
}

export default apiClient
