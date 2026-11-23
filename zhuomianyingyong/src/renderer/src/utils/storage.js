import { createInitialData, STORAGE_KEY } from './appData'

const isBrowserStorageAvailable = () => typeof window !== 'undefined' && window.localStorage

export const readStoredData = () => {
  if (!isBrowserStorageAvailable()) return createInitialData()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialData()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.projects)) return createInitialData()
    const initial = createInitialData()
    const isLegacyDefaultProfile = parsed.profile?.name === '林同学'
    return {
      ...initial,
      ...parsed,
      profile: isLegacyDefaultProfile ? initial.profile : { ...initial.profile, ...parsed.profile },
      projects: parsed.projects
    }
  } catch {
    return createInitialData()
  }
}

export const writeStoredData = (data) => {
  if (!isBrowserStorageAvailable()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('本地数据保存失败', error)
  }
}

export const resetStoredData = () => {
  if (isBrowserStorageAvailable()) window.localStorage.removeItem(STORAGE_KEY)
  return createInitialData()
}
