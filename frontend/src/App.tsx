import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { Home } from '@/pages/Home'
import { Datasets } from '@/pages/Datasets'
import { Models } from '@/pages/Models'
import { ModelRegistry } from '@/pages/ModelRegistry'
import { Trust } from '@/pages/Trust'
import { Analytics } from '@/pages/Analytics'
import { Blockchain } from '@/pages/Blockchain'
import { Cybersecurity } from '@/pages/Cybersecurity'
import { Attacks } from '@/pages/Attacks'
import { XAI } from '@/pages/XAI'
import { Provenance } from '@/pages/Provenance'
import { Login } from '@/pages/Login'
import { VideoAnalysis } from '@/pages/VideoAnalysis'
import { DriftMonitor } from '@/pages/DriftMonitor'
import { Robustness } from '@/pages/Robustness'
import { Performance } from '@/pages/Performance'
import { Wallets } from '@/pages/Wallets'
import { Reports } from '@/pages/Reports'
import { Team } from '@/pages/Team'
import { Settings } from '@/pages/Settings'
import { Help } from '@/pages/Help'
import { TamperDetection } from '@/pages/TamperDetection'
import { NotFound } from '@/pages/NotFound'
import { Contracts } from '@/pages/Contracts'
import { ContractsEngine } from '@/pages/ContractsEngine'
import { Audit } from '@/pages/Audit'
import { CyberAttack } from '@/pages/CyberAttack'
import { BackdoorDetection } from '@/pages/BackdoorDetection'
import { DatasetAnalysis } from '@/pages/DatasetAnalysis'
import { AssuranceReport } from '@/pages/AssuranceReport'
import { ModelIntegrity } from '@/pages/ModelIntegrity'
import { SecurityGovernance } from '@/pages/SecurityGovernance'
import { Upload } from '@/pages/Upload'

function App() {
  return (
    <>
      <CommandPalette />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="datasets" element={<Datasets />} />
          <Route path="models" element={<Models />} />
          <Route path="model-registry" element={<ModelRegistry />} />
          <Route path="trust" element={<Trust />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="blockchain" element={<Blockchain />} />
          <Route path="cybersecurity" element={<Cybersecurity />} />
          <Route path="attacks" element={<Attacks />} />
          <Route path="xai" element={<XAI />} />
          <Route path="provenance" element={<Provenance />} />
          <Route path="video" element={<VideoAnalysis />} />
          <Route path="drift" element={<DriftMonitor />} />
          <Route path="robustness" element={<Robustness />} />
          <Route path="performance" element={<Performance />} />
          <Route path="wallets" element={<Wallets />} />
          <Route path="reports" element={<Reports />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
          <Route path="tamper" element={<TamperDetection />} />
          <Route path="model-integrity" element={<ModelIntegrity />} />
          <Route path="security-governance" element={<SecurityGovernance />} />
          <Route path="backdoor" element={<BackdoorDetection />} />
          <Route path="dataset-analysis" element={<DatasetAnalysis />} />
          <Route path="assurance" element={<AssuranceReport />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="contracts-engine" element={<ContractsEngine />} />
          <Route path="audit" element={<Audit />} />
          <Route path="cyber-attack" element={<CyberAttack />} />
          <Route path="upload" element={<Upload />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
