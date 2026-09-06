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
  console.log('📡 [API GET] Fetching user data from /api/user-data')
  try {
    const res = await fetch(`${API_BASE}/user-data`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`API returned ${res.status}`)
    const json = await res.json()
    if (json.success && json.data) {
      setLocalCache(json.data.student || json.data)
      return { source: 'api', data: json.data }
    }
  } catch (err) {
    console.info('Backend API offline or unreachable, using local cache:', err.message)
  }

  const cached = getLocalCache()
  return { source: 'local', data: cached }
}

/**
 * Saves full user state to backend API and localStorage
 */
export async function saveUserData(data) {
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
    return { success: true, source: 'local', data }
  }
}

/**
 * Student or Company Login API
 */
export async function apiLogin(email, role = 'student') {
  console.log(`📡 [API POST] Logging in as ${role} (${email}) to /api/login`)
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    })
    return await res.json()
  } catch (err) {
    console.warn('API login request error:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Logout API
 */
export async function apiLogout() {
  console.log('📡 [API POST] Logging out from /api/logout')
  try {
    const res = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    return await res.json()
  } catch (err) {
    console.warn('API logout request error:', err.message)
    return { success: true }
  }
}

/**
 * Update Profile Details API
 */
export async function apiUpdateProfile(profileData) {
  console.log('📡 [API POST] Updating profile details to /api/profile', profileData)
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    })
    return await res.json()
  } catch (err) {
    console.warn('API profile request error:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Saves selected keywords via backend API and updates local cache
 */
export async function saveKeywords(keywords, currentData = {}) {
  console.log('📡 [API POST] Saving keywords to /api/keywords', keywords)
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
export async function saveAssessmentResult(type, result, currentData = {}) {
  console.log(`📡 [API POST] Submitting ${type} test to /api/assessments`, result)
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
export async function submitJobApplication(jobId, role, company, currentData = {}) {
  console.log(`📡 [API POST] Applying to ${role} at ${company} via /api/applications`)
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
export async function bookMentorSession(bookingData, currentData = {}) {
  console.log('📡 [API POST] Booking mentor guidance session via /api/mentor-bookings', bookingData)
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

export const apiBookMentor = bookMentorSession

/**
 * Enroll in a certified course via backend API
 */
export async function apiEnrollCourse(courseId, courseTitle) {
  console.log(`📡 [API POST] Enrolling in course ${courseId} via /api/courses/enroll`)
  try {
    const res = await fetch(`${API_BASE}/courses/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, courseTitle }),
    })
    return await res.json()
  } catch (err) {
    console.warn('Course enrollment API error:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Post a new company internship opening via backend API
 */
export async function apiPostCompanyJob(jobData) {
  console.log('📡 [API POST] Posting new company job via /api/company/jobs', jobData)
  try {
    const res = await fetch(`${API_BASE}/company/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    })
    return await res.json()
  } catch (err) {
    console.warn('Company job posting API error:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Resets database and local storage
 */
export async function resetSystemData() {
  console.log('📡 [API POST] Resetting system data via /api/reset')
  localStorage.removeItem(STORAGE_KEY)
  try {
    await fetch(`${API_BASE}/reset`, { method: 'POST' })
  } catch (err) {
    console.info('API offline during reset:', err.message)
  }
}
