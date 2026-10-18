import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { LangCode } from '../lib/config'
import { zh, type Dict } from './zh'
import { en } from './en'
import { ja } from './ja'

const DICTS: Record<LangCode, Dict> = { zh, en, ja }

export const LANG_LABELS: Record<LangCode, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
}

interface I18nValue {
  lang: LangCode
  t: Dict
  setLang: (lang: LangCode) => void
  /** True when ?lang= pinned the language, in which case the switcher hides. */
  lockLang: boolean
}

const I18nContext = createContext<I18nValue | null>(null)

const STORAGE_KEY = 'sub2api-home-lang'

export function I18nProvider({
  initialLang,
  lockLang,
  children,
}: {
  initialLang: LangCode
  /** True when ?lang= pinned the language; the switcher then hides. */
  lockLang: boolean
  children: ReactNode
}) {
  const [lang, setLangState] = useState<LangCode>(initialLang)

  const setLang = useCallback((next: LangCode) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage may be unavailable inside a partitioned iframe */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang =
      lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja' : 'en'
  }, [lang])

  const value = useMemo<I18nValue>(
    () => ({ lang, t: DICTS[lang], setLang, lockLang }),
    [lang, setLang, lockLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>')
  return value
}

export type { Dict, LangCode }
