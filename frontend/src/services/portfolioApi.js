import { apiRequest } from '../api/client'
import { experiences as defaultExperiences, profile as defaultProfile, projects as defaultProjects, socials as defaultSocials } from '../data/portfolio'

const STORAGE_KEY = 'dheekarsw-portfolio-content-v1'
export const API_MODE = import.meta.env.VITE_PORTFOLIO_API_MODE || 'mock'

// Keep this map aligned with the routes exposed by your FastAPI application.
export const API_ROUTES = {
  profile: '/profiles',
  experiences: '/experiences',
  projects: '/projects',
  uploadImage: '/media/upload-image',
}

export const defaultPortfolio = {
  profile: defaultProfile,
  experiences: defaultExperiences,
  projects: defaultProjects,
  socials: defaultSocials,
}

const clone = (value) => JSON.parse(JSON.stringify(value))

export function readMockPortfolio() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return clone(defaultPortfolio)
    const parsed = JSON.parse(saved)
    return {
      profile: { ...clone(defaultProfile), ...(parsed.profile || {}) },
      experiences: Array.isArray(parsed.experiences) ? parsed.experiences : clone(defaultExperiences),
      projects: Array.isArray(parsed.projects) ? parsed.projects : clone(defaultProjects),
      socials: Array.isArray(parsed.socials) ? parsed.socials : clone(defaultSocials),
    }
  } catch {
    return clone(defaultPortfolio)
  }
}

export function writeMockPortfolio(content) {
  if (API_MODE !== 'mock') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  } catch {
    throw new Error('Browser storage is full. Use smaller images or connect the FastAPI backend for media storage.')
  }
}

async function request(path, options = {}) {
  const response = await apiRequest(path, options)
  if (response?.cleanupWarnings?.length) {
    console.warn('Some old Cloudinary images could not be deleted. Use POST /media/retry-deletions.', response.cleanupWarnings)
    window.dispatchEvent(new CustomEvent('portfolio-cleanup-warning', { detail: response.cleanupWarnings }))
  }
  return response
}

function firstRecord(payload) {
  if (Array.isArray(payload)) return payload[0] || {}
  if (Array.isArray(payload?.profiles)) return payload.profiles[0] || {}
  if (Array.isArray(payload?.data)) return payload.data[0] || {}
  return payload?.profile || payload?.data?.profile || payload?.data || payload || {}
}
function records(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.data?.experiences)) return payload.data.experiences
  if (Array.isArray(payload?.data?.projects)) return payload.data.projects
  if (Array.isArray(payload?.experiences)) return payload.experiences
  if (Array.isArray(payload?.projects)) return payload.projects
  return []
}
function record(payload, key) {
  return payload?.[key] || payload?.data?.[key] || payload?.data || payload || {}
}
function normalizeProfile(recordValue) {
  const profile = recordValue || {}
  return {
    ...clone(defaultProfile),
    ...profile,
    intro: profile.intro ?? profile.description ?? defaultProfile.intro,
    photo: profile.photo ?? profile.photo_url ?? profile.photoUrl ?? defaultProfile.photo,
    aboutLabel: profile.aboutLabel ?? profile.about_label ?? defaultProfile.aboutLabel,
    aboutTitle: profile.aboutTitle ?? profile.about_title ?? defaultProfile.aboutTitle,
    aboutText: profile.aboutText ?? profile.about_text ?? defaultProfile.aboutText,
    aboutTags: profile.aboutTags ?? profile.about_tags ?? defaultProfile.aboutTags,
    photoPublicId: profile.photoPublicId ?? profile.photo_public_id ?? '',
  }
}

function normalizeSocials(profile, payload) {
  if (Array.isArray(payload?.socials)) return payload.socials
  if (Array.isArray(profile?.socials)) return profile.socials
  return clone(defaultSocials).map((item) => ({ ...item, url: Object.prototype.hasOwnProperty.call(profile || {}, item.id) ? profile[item.id] : item.url }))
}

export async function fetchPortfolio() {
  if (API_MODE === 'mock') return readMockPortfolio()
  const [profileResponse, experienceResponse, projectResponse] = await Promise.all([
    request(API_ROUTES.profile), request(API_ROUTES.experiences), request(API_ROUTES.projects),
  ])
  const rawProfile = firstRecord(profileResponse)
  const remoteProfile = normalizeProfile(rawProfile)
  return {
    profile: remoteProfile,
    experiences: records(experienceResponse),
    projects: records(projectResponse),
    socials: normalizeSocials(remoteProfile, profileResponse),
  }
}

export async function saveProfileRemote(profile) {
  if (API_MODE === 'mock') return profile
  const payload = {
    name: profile.name,
    brand: profile.brand,
    role: profile.role || '',
    location: profile.location || '',
    greeting: profile.greeting || '',
    intro: profile.intro || '',
    aboutLabel: profile.aboutLabel || '',
    aboutTitle: profile.aboutTitle || '',
    aboutText: profile.aboutText || '',
    aboutTags: profile.aboutTags || [],
    email: profile.email,
    photo: profile.photo || null,
    photoPublicId: profile.photoPublicId || null,
    socials: profile.socials || [],
  }
  const currentId = profile.id || profile._id
  const result = await request(currentId ? `${API_ROUTES.profile}/${encodeURIComponent(currentId)}` : API_ROUTES.profile, {
    method: currentId ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  })
  if (result.cleanupWarnings?.length) console.warn('Cloudinary cleanup queued:', result.cleanupWarnings)
  return normalizeProfile(result.data)
}
function serializeExperience(item) {
  return {
    company: item.company,
    shortCompany: item.shortCompany || '',
    role: item.role,
    location: item.location || '',
    period: item.period,
    type: item.type || '',
    description: item.description,
    mark: item.mark || '',
    color: item.color || 'forest',
    logoUrl: item.logoUrl || null,
    logoPublicId: item.logoPublicId || null,
  }
}
function serializeProject(item) {
  return {
    title: item.title, slug: item.slug, category: item.category,
    year: item.year || '', shortDescription: item.shortDescription || '',
    summary: item.summary || '', description: item.description,
    highlights: item.highlights || [], stack: item.stack || [],
    coverImage: item.coverImage || null,
    coverPublicId: item.coverPublicId || null,
    projectUrl: item.projectUrl || null, repositoryUrl: item.repositoryUrl || null,
    visual: item.visual || 'vision', accent: item.accent || '#c7e8d7',
    previewLabel: item.previewLabel || 'Project preview',
    snapshots: (item.snapshots || []).map((snapshot) => ({
      title: snapshot.title || 'Project snapshot',
      caption: snapshot.caption || '',
      image: snapshot.image || null,
      imagePublicId: snapshot.imagePublicId || null,
    })),
  }
}
export async function createExperienceRemote(item) {
  if (API_MODE === 'mock') return item
  return record(await request(API_ROUTES.experiences, { method: 'POST', body: JSON.stringify(serializeExperience(item)) }), 'experience')
}
export async function updateExperienceRemote(id, item) {
  if (API_MODE === 'mock') return item
  return record(await request(`${API_ROUTES.experiences}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(serializeExperience(item)) }), 'experience')
}
export async function deleteExperienceRemote(id) {
  if (API_MODE === 'mock') return null
  return request(`${API_ROUTES.experiences}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
export async function createProjectRemote(item) {
  if (API_MODE === 'mock') return item
  return record(await request(API_ROUTES.projects, { method: 'POST', body: JSON.stringify(serializeProject(item)) }), 'project')
}
export async function updateProjectRemote(id, item) {
  if (API_MODE === 'mock') return item
  return record(await request(`${API_ROUTES.projects}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(serializeProject(item)) }), 'project')
}
export async function deleteProjectRemote(id) {
  if (API_MODE === 'mock') return null
  return request(`${API_ROUTES.projects}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
export async function saveSocialsRemote(socials, profile) {
  const nextProfile = {
    ...profile,
    socials,
    linkedin: socials.find((item) => item.id === 'linkedin')?.url || '',
    github: socials.find((item) => item.id === 'github')?.url || '',
    itch: socials.find((item) => item.id === 'itch')?.url || '',
  }
  if (API_MODE === 'mock') return { profile: nextProfile, socials }
  const savedProfile = await saveProfileRemote(nextProfile)
  return { profile: { ...nextProfile, ...savedProfile }, socials }
}

function compressImage(file, maxSide = 1000, quality = 0.74) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read this image.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('This file could not be opened as an image.'))
      image.onload = () => {
        const ratio = Math.min(1, maxSide / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * ratio))
        canvas.height = Math.max(1, Math.round(image.height * ratio))
        const context = canvas.getContext('2d')
        if (!context) return reject(new Error('Image compression is not supported in this browser.'))
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export async function uploadImage(file, folder = 'portfolio') {
  if (!file) return ''
  if (API_MODE === 'mock') return { url: await compressImage(file, folder.startsWith('projects') ? 800 : 720, 0.64), publicId: '' }
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  const response = await request(API_ROUTES.uploadImage, { method: 'POST', body: form })
  const payload = response?.data || response
  const url = payload?.secure_url || payload?.url || payload?.photo_url || payload?.image_url
  if (!url) throw new Error('Upload succeeded but the API response has no secure_url/url field.')
  return { url, publicId: payload?.public_id || payload?.publicId || payload?.photo_public_id || '' }
}

// Only removes images no longer referenced by MongoDB. A 409 means the image
// is still saved and will be removed when the edited record is saved.
export async function deleteUnusedImage(publicId) {
  if (API_MODE === 'mock' || !publicId) return
  return request('/media/delete-image', {
    method: 'POST', body: JSON.stringify({ publicId }),
  })
}
