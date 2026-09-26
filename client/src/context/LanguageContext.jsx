import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Default to Bengali for first-time visitors; a visitor's explicit choice
    // is persisted and wins over the default
    return localStorage.getItem('language') || 'bn'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.setAttribute('data-lang', language)
    document.documentElement.lang = language
  }, [language])

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en')
  }

  const t = (content) => {
    if (typeof content === 'string') return content
    return content[language] || content.en || ''
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
