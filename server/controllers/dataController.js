import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.resolve(__dirname, '../data/db.json')

const DEFAULT_STATE = {
  student: {
    name: 'Arjun Sharma',
    email: 'arjun@ayush.edu',
    college: 'National Institute of Ayurveda (NIA), Jaipur',
    year: 'Final Year (2024)',
    course: 'BAMS',
    selectedKeywords: [],
    foundation: null,
    specialization: null,
    practicedSkills: {},
    applications: [],
    mentorBookings: [],
    enrolledCourses: [],
  },
  company: {
    name: 'Himalaya Wellness',
    email: 'hr@himalaya.com',
    jobs: [],
  },
  metadata: {
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
  },
}

// Helper to read db.json safely
async function readDb() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8')
    return JSON.parse(raw)
  } catch {
    // If file doesn't exist or is corrupted, reinitialize with defaults
    await writeDb(DEFAULT_STATE)
    return DEFAULT_STATE
  }
}

// Helper to write to db.json safely
async function writeDb(data) {
  data.metadata = {
    ...data.metadata,
    lastUpdated: new Date().toISOString(),
  }
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8')
  return data
}

export async function getHealth(req, res) {
  res.json({
    status: 'ok',
    message: 'Ayush Connect API is active and running',
    timestamp: new Date().toISOString(),
  })
}

export async function getUserData(req, res) {
  try {
    const db = await readDb()
    res.json({ success: true, data: db })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateUserData(req, res) {
  try {
    const db = await readDb()
    const incoming = req.body

    // Merge student attributes
    if (incoming.student) {
      db.student = { ...db.student, ...incoming.student }
    } else if (incoming.selectedKeywords || incoming.foundation || incoming.specialization) {
      // Direct student payload
      db.student = { ...db.student, ...incoming }
    }

    if (incoming.company) {
      db.company = { ...db.company, ...incoming.company }
    }

    await writeDb(db)
    res.json({ success: true, message: 'Data updated successfully', data: db })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateKeywords(req, res) {
  try {
    const { keywords } = req.body
    if (!Array.isArray(keywords)) {
      return res.status(400).json({ success: false, error: 'Keywords must be an array' })
    }

    const db = await readDb()
    db.student.selectedKeywords = keywords
    await writeDb(db)

    res.json({
      success: true,
      message: `Selected ${keywords.length} keywords successfully`,
      keywords: db.student.selectedKeywords,
      student: db.student,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function saveAssessment(req, res) {
  try {
    const { type, result } = req.body
    if (!type || !result) {
      return res.status(400).json({ success: false, error: 'Test type and result are required' })
    }

    const db = await readDb()
    if (type === 'foundation') {
      db.student.foundation = result
    } else if (type === 'specialization') {
      db.student.specialization = result
    } else {
      return res.status(400).json({ success: false, error: 'Invalid assessment type' })
    }

    await writeDb(db)
    res.json({
      success: true,
      message: `${type} assessment recorded successfully`,
      student: db.student,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function submitApplication(req, res) {
  try {
    const { jobId, role, company } = req.body
    if (!jobId || !role || !company) {
      return res.status(400).json({ success: false, error: 'jobId, role, and company are required' })
    }

    const db = await readDb()
    const alreadyApplied = (db.student.applications || []).some((a) => a.jobId === jobId)

    if (alreadyApplied) {
      return res.status(400).json({ success: false, error: 'Application already submitted for this opening' })
    }

    const newApplication = {
      id: `app-${Date.now()}`,
      jobId,
      role,
      company,
      appliedAt: new Date().toISOString(),
      status: 'Under Review',
    }

    db.student.applications = [...(db.student.applications || []), newApplication]
    await writeDb(db)

    res.json({
      success: true,
      message: 'Application submitted successfully',
      application: newApplication,
      applications: db.student.applications,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function bookMentor(req, res) {
  try {
    const { mentorId, mentorName, keyword, note, date } = req.body
    if (!mentorId || !mentorName || !keyword) {
      return res.status(400).json({ success: false, error: 'mentorId, mentorName, and keyword are required' })
    }

    const db = await readDb()
    const booking = {
      id: `mb-${Date.now()}`,
      mentorId,
      mentorName,
      keyword,
      note: note || '',
      date: date || new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      bookedAt: new Date().toISOString(),
    }

    db.student.mentorBookings = [...(db.student.mentorBookings || []), booking]
    await writeDb(db)

    res.json({
      success: true,
      message: 'Mentor session booked successfully',
      booking,
      mentorBookings: db.student.mentorBookings,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function resetData(req, res) {
  try {
    await writeDb(DEFAULT_STATE)
    res.json({ success: true, message: 'Database reset to default seed state', data: DEFAULT_STATE })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function handleLogin(req, res) {
  try {
    const { email, role = 'student' } = req.body
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' })
    }
    const db = await readDb()
    const normalized = email.trim().toLowerCase()

    if (role === 'company') {
      db.company = {
        ...db.company,
        email: normalized,
        name: normalized.includes('himalaya') ? 'Himalaya Wellness' : 'AYUSH Industry Partner',
      }
      await writeDb(db)
      return res.json({
        success: true,
        message: 'Company logged in successfully',
        role: 'company',
        user: db.company,
      })
    }

    // Student Login
    if (!db.users) db.users = {}
    if (!db.users[normalized]) {
      const rawPrefix = (normalized.includes('@') ? normalized.split('@')[0] : normalized).trim()
      const formattedName =
        rawPrefix
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()) || rawPrefix

      db.users[normalized] = {
        student: {
          ...DEFAULT_STATE.student,
          email: normalized,
          name: formattedName,
        },
        foundation: null,
        specialization: null,
        specializationScores: {},
        roadmapProgress: {},
      }
    }

    db.student = db.users[normalized].student
    db.currentStudentEmail = normalized
    await writeDb(db)

    res.json({
      success: true,
      message: 'Student logged in successfully',
      role: 'student',
      user: db.users[normalized],
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function handleLogout(req, res) {
  try {
    const db = await readDb()
    db.currentStudentEmail = null
    await writeDb(db)
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateProfile(req, res) {
  try {
    const { email, college, studyYear, contact, name } = req.body
    const db = await readDb()
    const normalized = (email || db.currentStudentEmail || db.student?.email || '').trim().toLowerCase()

    const updateFields = {
      ...(college !== undefined && { college }),
      ...(studyYear !== undefined && { studyYear }),
      ...(contact !== undefined && { contact }),
      ...(name !== undefined && { name }),
    }

    if (db.student) {
      db.student = { ...db.student, ...updateFields }
    }
    if (normalized && db.users && db.users[normalized]) {
      db.users[normalized].student = { ...db.users[normalized].student, ...updateFields }
    }

    await writeDb(db)
    res.json({
      success: true,
      message: 'Profile details saved successfully',
      student: db.student,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function enrollCourse(req, res) {
  try {
    const { courseId, courseTitle } = req.body
    if (!courseId) {
      return res.status(400).json({ success: false, error: 'courseId is required' })
    }
    const db = await readDb()
    const enrollment = {
      courseId,
      courseTitle: courseTitle || courseId,
      enrolledAt: new Date().toISOString(),
      status: 'Active',
    }

    const currentEnrollments = db.student.enrolledCourses || []
    if (!currentEnrollments.some((e) => (typeof e === 'string' ? e === courseId : e.courseId === courseId))) {
      db.student.enrolledCourses = [...currentEnrollments, enrollment]
      await writeDb(db)
    }

    res.json({
      success: true,
      message: 'Enrolled in course successfully',
      enrolledCourses: db.student.enrolledCourses,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function postCompanyJob(req, res) {
  try {
    const { company, role, location, description, keywords, openings } = req.body
    if (!role || !company) {
      return res.status(400).json({ success: false, error: 'Role and Company are required' })
    }
    const db = await readDb()
    const newJob = {
      id: `company-job-${Date.now()}`,
      company,
      role,
      location: location || 'India',
      description: description || '',
      keywords: keywords || [],
      openings: Number(openings) || 1,
      applicants: 0,
      postedByCompany: true,
      postedAt: new Date().toISOString(),
      tags: ['Company posting'],
    }
    if (!db.jobs) db.jobs = []
    db.jobs.unshift(newJob)
    await writeDb(db)

    res.json({
      success: true,
      message: 'Job posting created successfully',
      job: newJob,
      jobs: db.jobs,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function uploadResume(req, res) {
  try {
    const { email, resumeName, resumeData } = req.body
    const db = await readDb()
    if (db.student) {
      db.student.resumeName = resumeName
      db.student.resumeData = resumeData
    }
    await writeDb(db)
    res.json({ success: true, message: 'Resume uploaded successfully', resumeName })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateApplicationStatus(req, res) {
  try {
    const { appId, status } = req.body
    const db = await readDb()
    if (db.student && db.student.applications) {
      db.student.applications = db.student.applications.map((a) =>
        (a.id === appId || a.jobId === appId) ? { ...a, status } : a
      )
    }
    await writeDb(db)
    res.json({ success: true, message: `Application status updated to ${status}`, appId, status })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}


