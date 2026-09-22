import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

export const apiClient = {
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
}

export default apiClient
