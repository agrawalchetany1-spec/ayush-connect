import { STORAGE_KEY } from './data'

const API_BASE = '/api'

// Helper to get local cached state
function getLocalCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Helper to set local cache
function setLocalCache(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.warn('Unable to write to localStorage cache:', err)
  }
}

/**
 * Fetches user data from backend API with fallback to localStorage
 */
export async function fetchUserData() {
  try {
    const res = await fetch(`${API_BASE}/user-data`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`API returned ${res.status}`)
    const json = await res.json()
    if (json.success && json.data) {
      // Sync to localStorage
      const studentData = json.data.student || json.data
      setLocalCache(studentData)
      return { source: 'api', data: studentData }
    }
  } catch (err) {
    console.info('Backend API offline or unreachable, using local cache:', err.message)
  }

  // Fallback to local storage
  const cached = getLocalCache()
  return { source: 'local', data: cached }
}

/**
 * Saves full user state to backend API and localStorage
 */
export async function saveUserData(data) {
  // Always update local cache immediately for instant UI response
  setLocalCache(data)

  try {
    const res = await fetch(`${API_BASE}/user-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`API returned ${res.status}`)
    const json = await res.json()
    return { success: true, source: 'api', data: json.data?.student || json.data }
  } catch (err) {
    console.info('Saved to localStorage (API offline):', err.message)
    return { success: true, source: 'local', data }
  }
}

/**
 * Saves selected keywords via backend API and updates local cache
 */
export async function saveKeywords(keywords, currentData) {
  const updated = { ...currentData, selectedKeywords: keywords }
  setLocalCache(updated)

  try {
    const res = await fetch(`${API_BASE}/keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords }),
    })
    if (!res.ok) throw new Error(`API returned ${res.status}`)
    const json = await res.json()
    return { success: true, source: 'api', keywords: json.keywords }
  } catch (err) {
    console.info('Keywords updated locally (API offline):', err.message)
    return { success: true, source: 'local', keywords }
  }
}

/**
 * Saves foundation or specialization assessment result
 */
export async function saveAssessmentResult(type, result, currentData) {
  const updated = { ...currentData, [type]: result }
  setLocalCache(updated)

  try {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, result }),
    })
    if (!res.ok) throw new Error(`API returned ${res.status}`)
    const json = await res.json()
    return { success: true, source: 'api', student: json.student }
  } catch (err) {
    console.info('Assessment saved locally (API offline):', err.message)
    return { success: true, source: 'local', updated }
  }
}

/**
 * Submits an internship application via backend API
 */
export async function submitJobApplication(jobId, role, company, currentData) {
  const newApp = {
    id: `app-${Date.now()}`,
    jobId,
    role,
    company,
    appliedAt: new Date().toISOString(),
    status: 'Under Review',
  }
  const updated = {
    ...currentData,
    applications: [...(currentData.applications || []), newApp],
  }
  setLocalCache(updated)

  try {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, role, company }),
    })
    if (!res.ok) throw new Error(`API returned ${res.status}`)
    const json = await res.json()
    return { success: true, source: 'api', applications: json.applications }
  } catch (err) {
    console.info('Application saved locally (API offline):', err.message)
    return { success: true, source: 'local', applications: updated.applications }
  }
}

/**
 * Schedules a mentor guidance session via backend API
 */
export async function bookMentorSession(bookingData, currentData) {
  const booking = {
    id: `mb-${Date.now()}`,
    ...bookingData,
    status: 'Confirmed',
    bookedAt: new Date().toISOString(),
  }
  const updated = {
    ...currentData,
    mentorBookings: [...(currentData.mentorBookings || []), booking],
  }
  setLocalCache(updated)

  try {
    const res = await fetch(`${API_BASE}/mentor-bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
    if (!res.ok) throw new Error(`API returned ${res.status}`)
    const json = await res.json()
    return { success: true, source: 'api', mentorBookings: json.mentorBookings }
  } catch (err) {
    console.info('Mentor booking saved locally (API offline):', err.message)
    return { success: true, source: 'local', mentorBookings: updated.mentorBookings }
  }
}

/**
 * Resets database and local storage
 */
export async function resetSystemData() {
  localStorage.removeItem(STORAGE_KEY)
  try {
    await fetch(`${API_BASE}/reset`, { method: 'POST' })
  } catch (err) {
    console.info('API offline during reset:', err.message)
  }
}
