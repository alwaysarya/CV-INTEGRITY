import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { getLanguage, setLanguage, Language } from '@/i18n/translations'

export function LanguageSwitcher() {
  const [lang, setLang] = useState<Language>(getLanguage())

  useEffect(() => {
    const handler = () => setLang(getLanguage())
    window.addEventListener('languageChange', handler)
    return () => window.removeEventListener('languageChange', handler)
  }, [])

  const toggle = () => {
    const next: Language = lang === 'en' ? 'hi' : 'en'
    setLanguage(next)
    setLang(next)
    window.location.reload() // Simple reload to apply
  }

  return (
    <button
      onClick={toggle}
      className="text-gray-400 hover:text-white transition-colors p-1 flex items-center gap-1"
      title={`Switch to ${lang === 'en' ? 'Hindi' : 'English'}`}
    >
      <Globe size={20} />
      <span className="text-[10px] font-bold uppercase">{lang}</span>
    </button>
  )
}
