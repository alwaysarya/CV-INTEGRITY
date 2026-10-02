export const translations = {
  en: {
    // Sidebar
    dashboard: 'Dashboard',
    datasets: 'Datasets',
    upload: 'Upload',
    models: 'Models',
    trustScores: 'Trust Scores',
    analytics: 'Analytics',
    blockchain: 'Blockchain',
    cybersecurity: 'Cybersecurity',
    attackSimulator: 'Attack Simulator',
    tamperDetection: 'Tamper Detection',
    xai: 'XAI',
    videoAnalysis: 'Video Analysis',
    driftMonitor: 'Drift Monitor',
    robustness: 'Robustness',
    performance: 'Performance',
    wallets: 'Wallets',
    modelIntegrity: 'Model Integrity',
    backdoorDetection: 'Backdoor Detection',
    datasetAnalysis: 'Dataset Analysis',
    assuranceReport: 'Assurance Report',
    reports: 'Reports',
    team: 'Team',
    smartContracts: 'Smart Contracts',
    auditTrail: 'Audit Trail',
    cyberAttack: 'Cyber Attack',
    settings: 'Settings',
    // Topbar
    search: 'Search pages, models, blocks...',
    // Common
    refresh: 'Refresh',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
  },
  hi: {
    // Sidebar
    dashboard: 'डैशबोर्ड',
    datasets: 'डेटासेट',
    upload: 'अपलोड',
    models: 'मॉडल',
    trustScores: 'ट्रस्ट स्कोर',
    analytics: 'एनालिटिक्स',
    blockchain: 'ब्लॉकचेन',
    cybersecurity: 'साइबर सुरक्षा',
    attackSimulator: 'अटैक सिम्युलेटर',
    tamperDetection: 'टैम्पर डिटेक्शन',
    xai: 'एक्सप्लेनेबल AI',
    videoAnalysis: 'वीडियो एनालिसिस',
    driftMonitor: 'ड्रिफ्ट मॉनिटर',
    robustness: 'रोबस्टनेस',
    performance: 'परफॉर्मेंस',
    wallets: 'वॉलेट्स',
    modelIntegrity: 'मॉडल इंटीग्रिटी',
    backdoorDetection: 'बैकडोर डिटेक्शन',
    datasetAnalysis: 'डेटासेट एनालिसिस',
    assuranceReport: 'अश्योरेंस रिपोर्ट',
    reports: 'रिपोर्ट्स',
    team: 'टीम',
    smartContracts: 'स्मार्ट कॉन्ट्रैक्ट',
    auditTrail: 'ऑडिट ट्रेल',
    cyberAttack: 'साइबर अटैक',
    settings: 'सेटिंग्स',
    // Topbar
    search: 'पेज, मॉडल, ब्लॉक खोजें...',
    // Common
    refresh: 'रिफ्रेश',
    loading: 'लोड हो रहा है...',
    save: 'सेव',
    cancel: 'कैंसल',
  },
}

export type Language = 'en' | 'hi'

let currentLang: Language = 'en'

// Load from localStorage
const saved = localStorage.getItem('cv_lang') as Language
if (saved && (saved === 'en' || saved === 'hi')) {
  currentLang = saved
}

export function setLanguage(lang: Language) {
  currentLang = lang
  localStorage.setItem('cv_lang', lang)
  window.dispatchEvent(new Event('languageChange'))
}

export function getLanguage(): Language {
  return currentLang
}

export function t(key: string): string {
  return (translations[currentLang] as any)[key] || key
}
