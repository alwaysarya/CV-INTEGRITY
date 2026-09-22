import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// === API ENDPOINTS ===
export const apiClient = {
  // Root
  getRoot: () => api.get('/'),

  // Health
  getHealth: () => api.get('/health'),

  // Datasets
  getDatasets: () => api.get('/api/datasets'),
  getDataset: (name: string) => api.get(`/api/datasets/${name}`),

  // Models
  getModels: () => api.get('/api/models'),

  // Trust Scores
  getTrustScores: () => api.get('/api/trust-scores'),
  getTrustScore: (name: string) => api.get(`/api/trust-scores/${name}`),

  // Blockchain
  getBlockchain: () => api.get('/api/blockchain'),
  getBlocks: () => api.get('/api/blockchain/blocks'),
  getBlock: (index: number) => api.get(`/api/blockchain/block/${index}`),

  // Wallets
  getWallets: () => api.get('/api/wallets'),
  getWallet: (owner: string) => api.get(`/api/wallets/${owner}`),

  // Attacks
  getAttacks: () => api.get('/api/attacks'),
  getTamperDetection: () => api.get('/api/tamper-detection'),

  // Contracts
  getContracts: () => api.get('/api/contracts'),

  // Stats
  getStats: () => api.get('/api/stats'),

  // Verify
  verifyIntegrity: (data: any) => api.post('/api/verify', data),
}

export default apiClient
