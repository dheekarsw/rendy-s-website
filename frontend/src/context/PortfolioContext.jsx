import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { defaultPortfolio, API_MODE, fetchPortfolio, writeMockPortfolio, saveProfileRemote, createExperienceRemote, updateExperienceRemote, deleteExperienceRemote, createProjectRemote, updateProjectRemote, deleteProjectRemote, saveSocialsRemote } from '../services/portfolioApi'

const PortfolioContext = createContext(null)
const clone = (value) => JSON.parse(JSON.stringify(value))
const getRecordId = (item) => String(item?._id ?? item?.id ?? item?.slug ?? '')
const unwrapRecord = (response) => {
  if (!response || typeof response !== 'object') {
    return {}
  }

  // Backend mengembalikan:
  // { message: "...", data: { id, title, slug, ... } }
  return response.data ?? response
}

export function PortfolioProvider({ children }) {
  const [content, setContent] = useState(() => clone(defaultPortfolio))
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let alive = true
    fetchPortfolio()
      .then((data) => { if (alive) setContent(data) })
      .catch((error) => { if (alive) setLoadError(error.message || 'Could not load portfolio content.') })
      .finally(() => { if (alive) setIsLoading(false) })
    return () => { alive = false }
  }, [])

  const publish = useCallback((next) => {
    if (API_MODE === 'mock') writeMockPortfolio(next)
    setContent(next)
  }, [])

  const updateProfile = useCallback(async (fields) => {
    const updated = { ...content.profile, ...fields }
    if (API_MODE !== 'mock') {
      const saved = await saveProfileRemote(updated)
      Object.assign(updated, saved || {})
    }
    publish({ ...content, profile: updated })
  }, [content, publish])

  const saveExperience = useCallback(async (item, currentId = null) => {
    let saved = item
    if (currentId) {
      saved = { ...item, ...(await updateExperienceRemote(currentId, item) || {}) }
      publish({ ...content, experiences: content.experiences.map((entry) => getRecordId(entry) === String(currentId) ? saved : entry) })
    } else {
      const created = await createExperienceRemote(item)
      saved = { ...item, ...(created || {}) }
      publish({ ...content, experiences: [saved, ...content.experiences] })
    }
    return saved
  }, [content, publish])

  const removeExperience = useCallback(async (id) => {
    await deleteExperienceRemote(id)
    publish({ ...content, experiences: content.experiences.filter((item) => getRecordId(item) !== String(id)) })
  }, [content, publish])

  const saveProject = useCallback(async (item, currentId = null) => {
    let saved

    if (currentId) {
      const response = await updateProjectRemote(
        currentId,
        item
      )

      const project = unwrapRecord(response)

      saved = {
        ...item,
        ...project,
      }

      publish({
        ...content,
        projects: content.projects.map((entry) =>
          getRecordId(entry) === String(currentId) ||
          entry.slug === currentId
            ? saved
            : entry
        ),
      })
    } else {
      const response = await createProjectRemote(item)
      const project = unwrapRecord(response)

      saved = {
        ...item,
        ...project,
      }

      publish({
        ...content,
        projects: [saved, ...content.projects],
      })
    }

    return saved
  }, [content, publish])

  const removeProject = useCallback(async (id) => {
    await deleteProjectRemote(id)
    publish({ ...content, projects: content.projects.filter((item) => getRecordId(item) !== String(id) && item.slug !== id) })
  }, [content, publish])

  const updateSocials = useCallback(async (socials) => {
    const result = await saveSocialsRemote(socials, content.profile)
    const next = { ...content, profile: result.profile, socials: result.socials }
    publish(next)
  }, [content, publish])

  const value = useMemo(() => ({
    ...content, isLoading, loadError, updateProfile, saveExperience, removeExperience,
    saveProject, removeProject, updateSocials,
  }), [content, isLoading, loadError, updateProfile, saveExperience, removeExperience, saveProject, removeProject, updateSocials])

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const value = useContext(PortfolioContext)
  if (!value) throw new Error('usePortfolio must be used within PortfolioProvider')
  return value
}
