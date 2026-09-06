import { useEffect, useMemo, useState } from 'react'
import {
  STORAGE_KEY,
  loadSaved,
  FOUNDATION_QUESTIONS,
  SPECIALIZATION_QUESTIONS,
  SPECIALIZATIONS,
  INTERNSHIPS,
  DEFAULT_STUDENT,
  DEFAULT_JOBS,
  INDUSTRY_KEYWORDS,
  KEYWORD_GAP_INTERNSHIPS,
  KEYWORD_MENTORS,
  KEYWORD_COURSES,
  matchReport,
  scoreAnswers,
  skillLevel,
} from './data'
import {
  Logo,
  Shell,
  LoginCard,
  Quiz,
  ResponseList,
} from './UIComponents'
import {
  apiBookMentor,
  apiEnrollCourse,
  apiLogin,
  apiLogout,
  apiPostCompanyJob,
  apiUpdateProfile,
  fetchUserData,
  saveAssessmentResult,
  saveKeywords,
  saveUserData,
  submitJobApplication,
} from './api'

export default function App() {
  const saved = useMemo(() => {
    const data = loadSaved()
    if (!data) return {}
    // Backward compatibility with legacy single-user storage
    if (!data.users && data.student) {
      const legacyEmail = (data.student.email || 'aarav.sharma@college.edu').toLowerCase().trim()
      return {
        users: {
          [legacyEmail]: {
            student: { ...DEFAULT_STUDENT, ...data.student },
            foundation: data.foundation || null,
            specialization: data.specialization || null,
            roadmapProgress: data.roadmapProgress || {},
          },
        },
        currentStudentEmail: null,
        jobs: data.jobs,
        applications: data.applications,
      }
    }
    return data
  }, [])

  const [view, setView] = useState('landing')
  const [users, setUsers] = useState(saved.users || {})
  const [currentEmail, setCurrentEmail] = useState(saved.currentStudentEmail || null)

  const [student, setStudent] = useState(() => {
    if (saved.currentStudentEmail && saved.users?.[saved.currentStudentEmail]?.student) {
      return { ...DEFAULT_STUDENT, ...saved.users[saved.currentStudentEmail].student }
    }
    return DEFAULT_STUDENT
  })
  const [foundation, setFoundation] = useState(() => {
    if (saved.currentStudentEmail && saved.users?.[saved.currentStudentEmail]) {
      return saved.users[saved.currentStudentEmail].foundation || null
    }
    return null
  })
  const [specializationScores, setSpecializationScores] = useState(() => {
    if (saved.currentStudentEmail && saved.users?.[saved.currentStudentEmail]) {
      const userObj = saved.users[saved.currentStudentEmail]
      if (userObj.specializationScores) return userObj.specializationScores
      if (userObj.specialization) {
        return { [userObj.student?.specialization || 'qc']: userObj.specialization }
      }
    }
    return {}
  })
  const [roadmapProgress, setRoadmapProgress] = useState(() => {
    if (saved.currentStudentEmail && saved.users?.[saved.currentStudentEmail]) {
      return saved.users[saved.currentStudentEmail].roadmapProgress || {}
    }
    return {}
  })

  // Selected Specialization Track - null if not selected yet
  const activeSpecializationId = student.specialization || null
  const activeSpecialization = useMemo(() => {
    if (!activeSpecializationId) return null
    return SPECIALIZATIONS.find((s) => s.id === activeSpecializationId) || null
  }, [activeSpecializationId])

  // Active track test result
  const specialization = activeSpecializationId ? specializationScores[activeSpecializationId] || null : null

  const [jobs, setJobs] = useState(() => {
    const list = saved?.jobs || DEFAULT_JOBS
    return list.map((job, index) => ({
      id: job.id || `job-${index}-${job.title || job.role}`,
      role: job.role || job.title,
      company: job.company || 'Himalaya Wellness',
      location: job.location || 'India',
      openings: job.openings || 1,
      applicants: job.applicants || 0,
      tags: job.tags || ['Company posting'],
      keywords: job.keywords || [
        'Quality Control (QC) & Assay Testing',
        'GMP & Schedule T Compliance',
      ],
      ...job,
      postedByCompany: true,
    }))
  })
  const [applications, setApplications] = useState(saved?.applications || [])
  const [newJob, setNewJob] = useState({
    company: 'Himalaya Wellness',
    role: '',
    location: '',
    description: '',
    keywords: [],
  })
  const [openApplicant, setOpenApplicant] = useState(null)
  const [roadmapJobId, setRoadmapJobId] = useState(null)
  const [contactInput, setContactInput] = useState(student.contact || '')
  const [collegeInput, setCollegeInput] = useState(student.college || '')
  const [studyYearInput, setStudyYearInput] = useState(student.studyYear || '')
  const [profileSaved, setProfileSaved] = useState(false)
  const [skillBridgeTab, setSkillBridgeTab] = useState('internships') // 'internships' | 'mentors' | 'courses'
  const [appliedGapJobs, setAppliedGapJobs] = useState([])
  const [bookedMentors, setBookedMentors] = useState([])
  const [mentorModal, setMentorModal] = useState(null)

  const unselectedKeywords = useMemo(() => {
    const selected = student.keywords || []
    return INDUSTRY_KEYWORDS.filter((k) => !selected.includes(k))
  }, [student.keywords])

  const gapInternships = useMemo(() => {
    return KEYWORD_GAP_INTERNSHIPS.filter((item) => unselectedKeywords.includes(item.keyword))
  }, [unselectedKeywords])

  const gapMentors = useMemo(() => {
    return KEYWORD_MENTORS.filter((item) => unselectedKeywords.includes(item.keyword))
  }, [unselectedKeywords])

  const gapCourses = useMemo(() => {
    return KEYWORD_COURSES.filter((item) => unselectedKeywords.includes(item.keyword))
  }, [unselectedKeywords])

  useEffect(() => {
    setContactInput(student?.contact || '')
    setCollegeInput(student?.college || '')
    setStudyYearInput(student?.studyYear || '')
  }, [student?.contact, student?.college, student?.studyYear])

  function handleSaveProfile() {
    setStudent((prev) => ({
      ...prev,
      contact: contactInput,
      college: collegeInput,
      studyYear: studyYearInput,
    }))
    apiUpdateProfile({
      email: currentEmail,
      contact: contactInput,
      college: collegeInput,
      studyYear: studyYearInput,
    })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  function toggleStudentKeyword(kw) {
    setStudent((prev) => {
      const current = prev.keywords || []
      const next = current.includes(kw) ? current.filter((k) => k !== kw) : [...current, kw]
      saveKeywords(next, prev)
      return { ...prev, keywords: next }
    })
  }

  // Synchronize current active student's updates into the multi-user dictionary
  useEffect(() => {
    if (!currentEmail) return
    setUsers((prev) => ({
      ...prev,
      [currentEmail]: {
        student,
        foundation,
        specialization,
        specializationScores,
        roadmapProgress,
      },
    }))
  }, [student, foundation, specialization, specializationScores, roadmapProgress, currentEmail])

  // On startup: synchronize latest data from backend API
  useEffect(() => {
    fetchUserData().then((result) => {
      if (result?.data && result.source === 'api') {
        if (result.data.users) setUsers(result.data.users)
        if (result.data.jobs) setJobs(result.data.jobs)
        if (result.data.applications) setApplications(result.data.applications)
      }
    })
  }, [])

  // Persist all users, active email, jobs, and applications to localStorage and Backend API
  useEffect(() => {
    const payload = {
      users,
      currentStudentEmail: currentEmail,
      jobs,
      applications,
    }
    saveUserData(payload)
  }, [users, currentEmail, jobs, applications])

  function handleStudentLogin(email) {
    if (!email) return
    const normalizedEmail = email.trim().toLowerCase()
    apiLogin(normalizedEmail, 'student')
    const existingUserData = users[normalizedEmail]

    if (existingUserData) {
      // Existing user: restore their saved profile, test scores, resume, and roadmap
      setStudent({
        ...DEFAULT_STUDENT,
        ...existingUserData.student,
        specialization: existingUserData.student?.specialization || null,
      })
      setFoundation(existingUserData.foundation || null)
      setSpecializationScores(
        existingUserData.specializationScores ||
          (existingUserData.specialization
            ? { [existingUserData.student?.specialization || 'qc']: existingUserData.specialization }
            : {}),
      )
      setRoadmapProgress(existingUserData.roadmapProgress || {})
      setContactInput(existingUserData.student?.contact || '')
      setCollegeInput(existingUserData.student?.college || '')
      setStudyYearInput(existingUserData.student?.studyYear || '')
    } else {
      // Brand new user: fresh blank profile with no test scores or matching
      const rawPrefix = (email.includes('@') ? email.split('@')[0] : email).trim()
      const formattedName =
        rawPrefix
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()) || rawPrefix

      const freshStudent = {
        name: formattedName,
        email: email.trim(),
        contact: '',
        college: '',
        studyYear: '',
        keywords: [],
        interest: '',
        specialization: null,
        resumeName: '',
        resumeData: '',
      }

      setStudent(freshStudent)
      setFoundation(null)
      setSpecializationScores({})
      setRoadmapProgress({})
      setContactInput('')
      setCollegeInput('')
      setStudyYearInput('')

      setUsers((prev) => ({
        ...prev,
        [normalizedEmail]: {
          student: freshStudent,
          foundation: null,
          specializationScores: {},
          roadmapProgress: {},
        },
      }))
    }

    setCurrentEmail(normalizedEmail)
    setView('studentDashboard')
  }

  function handleStudentLogout() {
    apiLogout()
    setCurrentEmail(null)
    setView('landing')
  }

  const analysisReady = Boolean(foundation && specialization)
  const overall = useMemo(() => {
    if (!analysisReady) return null
    return Math.round((foundation.percent + specialization.percent) / 2)
  }, [analysisReady, foundation, specialization])

  const openInternships = useMemo(() => {
    const attach = (job) => {
      // Only attach matchReport if both tests are taken!
      const report = analysisReady
        ? matchReport(job, foundation, specialization, roadmapProgress[job.id] || {})
        : null
      return {
        ...job,
        keywords: job.keywords || [],
        match: report ? report.match : null,
        report,
      }
    }
    const companyPosts = jobs
      .filter((job) => job.postedByCompany)
      .map((job) =>
        attach({
          id: job.id,
          company: job.company,
          role: job.role || job.title,
          location: job.location || 'India',
          tags: job.tags || ['Company posting'],
          keywords: job.keywords || [],
          fromCompanyPortal: true,
          description: job.description || '',
        }),
      )
    const catalog = INTERNSHIPS.filter((job) => !companyPosts.some((posted) => posted.id === job.id)).map(attach)
    return [...companyPosts, ...catalog]
  }, [jobs, foundation, specialization, roadmapProgress, analysisReady])

  const studentKeywords = student.keywords || []
  const hasEnoughKeywords = studentKeywords.length >= 3

  const matchedInternships = useMemo(() => {
    if (!hasEnoughKeywords) return []
    return openInternships.filter((job) => {
      const jobKeywords = job.keywords || []
      return jobKeywords.some((k) => studentKeywords.includes(k))
    })
  }, [hasEnoughKeywords, openInternships, studentKeywords])

  const myApplications = useMemo(() => {
    const email = (student?.email || currentEmail || '').toLowerCase().trim()
    if (!email) return []
    return applications.filter(
      (a) =>
        (a.studentEmail && a.studentEmail.toLowerCase().trim() === email) ||
        (a.student?.email && a.student.email.toLowerCase().trim() === email),
    )
  }, [applications, student?.email, currentEmail])

  function applyToJob(job) {
    const userEmail = (student.email || currentEmail || '').toLowerCase().trim()
    const existing = applications.find(
      (a) =>
        a.jobId === job.id &&
        ((a.studentEmail && a.studentEmail.toLowerCase().trim() === userEmail) ||
          (a.student?.email && a.student.email.toLowerCase().trim() === userEmail)),
    )
    if (existing && existing.status !== 'Rejected') return
    submitJobApplication(job.id, job.role, job.company, student)
    const payload = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      role: job.role,
      company: job.company,
      status: 'Applied',
      isNew: true,
      appliedAt: new Date().toLocaleString(),
      studentEmail: userEmail,
      student: {
        name: student.name,
        email: student.email || userEmail,
        contact: student.contact || '',
        college: student.college || '',
        studyYear: student.studyYear || '',
        keywords: student.keywords || [],
        interest: student.interest || '',
        specialization: student.specialization || null,
        resumeName: student.resumeName,
        resumeData: student.resumeData || '',
      },
      matchedKeywords: (job.keywords || []).filter((k) => (student.keywords || []).includes(k)),
      foundation,
      specialization,
      overall,
    }
    setApplications((prev) => [
      payload,
      ...prev.filter(
        (a) =>
          !(
            a.jobId === job.id &&
            ((a.studentEmail && a.studentEmail.toLowerCase().trim() === userEmail) ||
              (a.student?.email && a.student.email.toLowerCase().trim() === userEmail))
          ),
      ),
    ])
    if (!existing) {
      setJobs((prev) =>
        prev.map((item) =>
          item.id === job.id || item.title === job.role
            ? { ...item, applicants: (item.applicants || 0) + 1 }
            : item,
        ),
      )
    }
  }

  function rejectApplicant(appId) {
    setApplications((prev) =>
      prev.map((app) =>
        (app.id || app.jobId) === appId
          ? { ...app, status: 'Rejected', isNew: false, rejectedAt: new Date().toLocaleString() }
          : app,
      ),
    )
  }

  function markApplicantSeen(appId) {
    setApplications((prev) =>
      prev.map((app) => ((app.id || app.jobId) === appId ? { ...app, isNew: false } : app)),
    )
  }

  const newApplicantCount = applications.filter((a) => a.isNew && a.status !== 'Rejected').length
  const sortedApplications = [...applications].sort((a, b) => {
    if (a.isNew && !b.isNew) return -1
    if (!a.isNew && b.isNew) return 1
    if (a.status === 'Rejected' && b.status !== 'Rejected') return 1
    if (a.status !== 'Rejected' && b.status === 'Rejected') return -1
    return 0
  })

  if (view === 'landing') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4f1ea]">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#2F5D50]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-24 h-96 w-96 rounded-full bg-[#e8c07a]/30 blur-3xl" />
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Logo onClick={() => setView('landing')} />
          <p className="hidden text-sm text-[#6b7c76] sm:block">Ministry of AYUSH · Skill bridge prototype</p>
        </header>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a6a2a]">Student × Company portal</p>
            <h1 className="mt-4 font-serif text-5xl leading-tight text-[#1f3d36] sm:text-6xl">
              Bridging academia and industry
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#4d5e59]">
              AYUSH students take skill assessments, see gap reports, and match with internships. Companies post roles and
              review ready talent.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setView('studentLogin')}
                className="rounded-2xl bg-[#2F5D50] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#2F5D50]/20 transition hover:bg-[#254a41]"
              >
                Student Portal
              </button>
              <button
                type="button"
                onClick={() => setView('companyLogin')}
                className="rounded-2xl border-2 border-[#2F5D50] bg-white px-8 py-4 text-lg font-semibold text-[#2F5D50] transition hover:bg-[#e8f0ec]"
              >
                Company Portal
              </button>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6">
              <p className="text-sm text-[#8a6a2a]">Foundation + Specialization</p>
              <p className="mt-1 font-serif text-2xl text-[#1f3d36]">Skill-gap analysis</p>
              <p className="mt-2 text-sm text-[#5c6b66]">Common aptitude, clinical guidelines, pharmacognosy, and QC.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#2F5D50] p-6 text-white">
                <p className="text-3xl font-semibold">2</p>
                <p className="mt-1 text-sm text-white/80">Assessment tracks</p>
              </div>
              <div className="rounded-2xl bg-[#e8c07a] p-6 text-[#3a2c10]">
                <p className="text-3xl font-semibold">Live</p>
                <p className="mt-1 text-sm">Internship matching</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (view === 'studentLogin') {
    return (
      <Shell
        onHome={() => setView('landing')}
        onBack={() => setView('landing')}
        backLabel="Back to home"
        right={<span className="text-sm text-[#6b7c76]">Student access</span>}
      >
        <LoginCard
          title="Student login"
          subtitle="Use your college email. This demo accepts any credentials."
          accent="bg-[#2F5D50] hover:bg-[#254a41]"
          onBack={() => setView('landing')}
          onSubmit={({ email }) => handleStudentLogin(email)}
        />
      </Shell>
    )
  }

  if (view === 'companyLogin') {
    return (
      <Shell
        onHome={() => setView('landing')}
        onBack={() => setView('landing')}
        backLabel="Back to home"
        right={<span className="text-sm text-[#6b7c76]">Industry access</span>}
      >
        <LoginCard
          title="Company login"
          subtitle="Post internships and review AYUSH student matches."
          accent="bg-[#8a6a2a] hover:bg-[#6f5420]"
          onBack={() => setView('landing')}
          onSubmit={({ email }) => {
            apiLogin(email || 'hr@himalaya.com', 'company')
            setView('companyDashboard')
          }}
        />
      </Shell>
    )
  }

  if (view === 'testsPage') {
    return (
      <Shell
        onHome={() => setView('studentDashboard')}
        onBack={() => setView('studentDashboard')}
        backLabel="Back to dashboard"
        right={
          <button type="button" onClick={handleStudentLogout} className="text-sm text-[#6b7c76] hover:text-rose-700">
            Logout
          </button>
        }
      >
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#8a6a2a]">
            AYUSH Skill Assessments
          </span>
          <h1 className="mt-1 font-serif text-4xl text-[#1f3d36]">Skill assessment tests</h1>
          <p className="mt-1 text-[#5c6b66]">
            Complete the Common Foundation Test and your assigned Specialization Test to generate your skill-gap report and unlock matching internships.
          </p>
        </div>

        {/* Assigned Track Banner */}
        {activeSpecialization ? (
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#d9d1c3] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0ec] text-2xl">
                {activeSpecialization.icon}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8a6a2a]">Assigned Specialization</p>
                <h3 className="font-serif text-xl font-semibold text-[#1f3d36]">{activeSpecialization.title}</h3>
                <p className="text-xs text-[#5c6b66]">{activeSpecialization.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setView('studentDashboard')}
              className="rounded-xl border border-[#2F5D50] px-4 py-2 text-xs font-semibold text-[#2F5D50] hover:bg-[#e8f0ec] transition"
            >
              Switch Track on Dashboard
            </button>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border-2 border-dashed border-[#8a6a2a] bg-[#faf8f3] p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8a6a2a]">Specialization Track</p>
                <h3 className="font-serif text-xl font-semibold text-[#1f3d36]">No specialization track selected yet</h3>
                <p className="text-xs text-[#5c6b66]">
                  Select one of the 4 specialization tracks below to assign your domain assessment.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => {
                    setStudent((prev) => ({
                      ...prev,
                      specialization: spec.id,
                      interest: spec.shortTitle,
                    }))
                  }}
                  className="flex items-center gap-3 rounded-xl border border-[#d9d1c3] bg-white p-3 text-left transition hover:border-[#2F5D50] hover:bg-[#e8f0ec]"
                >
                  <span className="text-2xl">{spec.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-[#1f3d36]">{spec.shortTitle}</p>
                    <p className="text-[11px] text-[#5c6b66] line-clamp-1">{spec.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Two Test Cards */}
        <div className="space-y-6">
          {/* Card 1: Common Foundation Test */}
          <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Common to all students
                </span>
                <h2 className="mt-2 font-serif text-2xl text-[#1f3d36]">1. Common Foundation Test</h2>
                <p className="mt-1 text-sm text-[#5c6b66]">
                  Aptitude, good clinical documentation (SOAP notes), lab safety (GLP), and healthcare ethics.
                </p>
                {foundation ? (
                  <p className="mt-2 text-sm font-semibold text-[#2F5D50]">
                    ✓ Completed — Score: {foundation.percent}% ({foundation.correct}/{foundation.total} correct)
                  </p>
                ) : (
                  <p className="mt-2 text-xs font-medium text-[#8a6a2a]">⚠️ Not taken yet</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setView('foundationTest')}
                className={`rounded-xl px-6 py-3 font-semibold transition ${
                  foundation
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-[#2F5D50] text-white hover:bg-[#254a41]'
                }`}
              >
                {foundation ? 'Retake Foundation Test' : 'Start Foundation Test'}
              </button>
            </div>
          </div>

          {/* Card 2: Specialization Test */}
          {activeSpecialization ? (
            <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-[#e8c07a]/40 px-3 py-1 text-xs font-semibold text-[#6b5220]">
                    Track-Specific Test · {activeSpecialization.shortTitle}
                  </span>
                  <h2 className="mt-2 font-serif text-2xl text-[#1f3d36]">
                    2. {activeSpecialization.title} Test
                  </h2>
                  <p className="mt-1 text-sm text-[#5c6b66]">
                    Evaluates domain skills: {activeSpecialization.skills.join(', ')}.
                  </p>
                  {specialization ? (
                    <p className="mt-2 text-sm font-semibold text-[#2F5D50]">
                      ✓ Completed — Score: {specialization.percent}% ({specialization.correct}/{specialization.total} correct)
                    </p>
                  ) : (
                    <p className="mt-2 text-xs font-medium text-[#8a6a2a]">⚠️ Not taken yet for this specialization</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setView('specializationTest')}
                  className={`rounded-xl px-6 py-3 font-semibold transition ${
                    specialization
                      ? 'bg-[#e8f0ec] text-[#2F5D50] hover:bg-[#d5e6de]'
                      : 'bg-[#2F5D50] text-white hover:bg-[#254a41]'
                  }`}
                >
                  {specialization ? 'Retake Track Test' : 'Start Track Test'}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d9d1c3] bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    Track-Specific Test · Track Selection Required
                  </span>
                  <h2 className="mt-2 font-serif text-2xl text-[#1f3d36]">
                    2. Specialization Test
                  </h2>
                  <p className="mt-1 text-sm text-[#5c6b66]">
                    Please select your specialization track in the section above before taking this test.
                  </p>
                </div>
                <span className="rounded-xl border border-[#d9d1c3] bg-[#faf8f3] px-5 py-2.5 text-xs font-semibold text-[#8a6a2a]">
                  Track selection needed
                </span>
              </div>
            </div>
          )}

          {/* Analysis preview or status */}
          <div className="rounded-2xl border border-[#e4ddd0] bg-[#faf8f3] p-6">
            <h3 className="font-semibold text-[#1f3d36]">Assessment readiness & Evaluation</h3>
            {analysisReady ? (
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#2F5D50] font-semibold">
                    ✓ Both tests completed! Assessment data is ready for comprehensive analysis.
                  </p>
                  <p className="mt-1 text-xs text-[#5c6b66]">
                    Click the Analysis button to calculate your official readiness report card and diagnose your missing industry keywords.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setView('reportPage')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#8a6a2a] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#6f5420] transition"
                  >
                    <span>📊 View Full Analysis & Report Card Page (With Graphs)</span>
                    <span>→</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('studentDashboard')}
                    className="rounded-xl border border-[#2F5D50] px-4 py-2.5 text-sm font-semibold text-[#2F5D50] hover:bg-[#e8f0ec] transition"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-[#5c6b66]">
                You have completed {Number(Boolean(foundation)) + Number(Boolean(specialization))} of 2 tests. Complete both tests to calculate your internship matching score.
              </p>
            )}
          </div>

          {/* Saved responses review */}
          {(foundation || specialization) && (
            <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1f3d36]">Review your submitted answers</h3>
                <button
                  type="button"
                  onClick={() => setView('reportPage')}
                  className="text-xs font-semibold text-[#8a6a2a] hover:underline"
                >
                  📊 Open Full Analysis & Missing Keywords Report Page →
                </button>
              </div>
              <ResponseList title="Common Foundation Answers" questions={FOUNDATION_QUESTIONS} result={foundation} />
              {activeSpecialization && (
                <ResponseList
                  title={`${activeSpecialization.title} Answers`}
                  questions={activeSpecialization.questions}
                  result={specialization}
                />
              )}
            </div>
          )}
        </div>
      </Shell>
    )
  }

  if (view === 'foundationTest') {
    return (
      <Shell
        onHome={() => setView('testsPage')}
        onBack={() => setView('testsPage')}
        backLabel="Back to tests"
      >
        <Quiz
          title="Common Foundation Test"
          questions={FOUNDATION_QUESTIONS}
          onCancel={() => setView('testsPage')}
          onFinish={(answers) => {
            const result = scoreAnswers(FOUNDATION_QUESTIONS, answers)
            setFoundation(result)
            saveAssessmentResult('foundation', result, student)
            setView('testsPage')
          }}
        />
      </Shell>
    )
  }

  if (view === 'specializationTest') {
    if (!activeSpecialization) {
      setView('testsPage')
      return null
    }
    return (
      <Shell
        onHome={() => setView('testsPage')}
        onBack={() => setView('testsPage')}
        backLabel="Back to tests"
      >
        <Quiz
          title={`${activeSpecialization.title} Test`}
          questions={activeSpecialization.questions}
          onCancel={() => setView('testsPage')}
          onFinish={(answers) => {
            const res = scoreAnswers(activeSpecialization.questions, answers)
            setSpecializationScores((prev) => ({
              ...prev,
              [activeSpecializationId]: res,
            }))
            saveAssessmentResult('specialization', res, student)
            setView('testsPage')
          }}
        />
      </Shell>
    )
  }

  if (view === 'roadmap') {
    const job = openInternships.find((item) => item.id === roadmapJobId) || openInternships[0]
    const report = job?.report
    const practiced = roadmapProgress[job?.id] || {}
    return (
      <Shell
        onHome={() => setView('studentDashboard')}
        onBack={() => setView('studentDashboard')}
        backLabel="Back to dashboard"
        right={
          <button type="button" onClick={handleStudentLogout} className="text-sm text-[#6b7c76] hover:text-rose-700">
            Logout
          </button>
        }
      >
        {!job ? (
          <p>No internship selected.</p>
        ) : !report ? (
          <div className="mx-auto max-w-xl text-center py-12">
            <h2 className="font-serif text-3xl text-[#1f3d36]">Assessment tests required</h2>
            <p className="mt-2 text-[#5c6b66]">
              Please complete both the Foundation and Specialization tests on your dashboard first to unlock your personalized skill roadmap.
            </p>
            <button
              type="button"
              onClick={() => setView('studentDashboard')}
              className="mt-6 rounded-xl bg-[#2F5D50] px-6 py-3 font-semibold text-white hover:bg-[#254a41]"
            >
              Back to dashboard
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#8a6a2a]">Skill roadmap</p>
            <h1 className="mt-2 font-serif text-4xl text-[#1f3d36]">Reach 100% match</h1>
            <p className="mt-2 text-[#5c6b66]">
              {job.role} · {job.company}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#2F5D50] p-5 text-white">
                <p className="text-sm text-white/80">Current match</p>
                <p className="font-serif text-4xl">{report.match}%</p>
              </div>
              <div className="rounded-2xl bg-[#e8c07a] p-5 text-[#3a2c10]">
                <p className="text-sm">Still missing</p>
                <p className="font-serif text-4xl">{report.unmatchedPercent}%</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-[#4d5e59]">
              Close each gap below. Mark a skill as practised after you finish the steps — your match moves toward 100%.
            </p>
            <div className="mt-6 space-y-4">
              {report.rows.map((row, index) => (
                <div key={row.skill} className="rounded-2xl border border-[#e4ddd0] bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6a2a]">Step {index + 1}</p>
                      <h2 className="font-serif text-2xl text-[#1f3d36]">{row.skill}</h2>
                      <p className="mt-1 text-sm text-[#5c6b66]">{row.roadmap?.why}</p>
                    </div>
                    <p className="text-sm font-semibold text-rose-800">
                      {row.gapShare}% not matching
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-[#4d5e59]">
                    You: {row.you}% · Company needs: 100% · This skill is {row.weight}% of the role
                  </p>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#243833]">
                    {(row.roadmap?.steps || []).map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    onClick={() =>
                      setRoadmapProgress((prev) => ({
                        ...prev,
                        [job.id]: { ...prev[job.id], [row.skill]: !practiced[row.skill] },
                      }))
                    }
                    className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold ${
                      practiced[row.skill]
                        ? 'bg-[#e8f0ec] text-[#2F5D50]'
                        : 'bg-[#2F5D50] text-white hover:bg-[#254a41]'
                    }`}
                  >
                    {practiced[row.skill] ? 'Practised — match updated' : 'Mark as practised'}
                  </button>
                </div>
              ))}
            </div>
            {report.match >= 100 ? (
              <p className="mt-6 rounded-2xl bg-[#e8f0ec] p-4 font-semibold text-[#2F5D50]">
                You are at 100% for this role. Apply from the dashboard.
              </p>
            ) : null}
          </div>
        )}
      </Shell>
    )
  }

  if (view === 'companyDashboard') {
    return (
      <Shell
        onHome={() => setView('landing')}
        onBack={() => setView('companyLogin')}
        backLabel="Back"
        right={
          <button type="button" onClick={() => { apiLogout(); setView('landing') }} className="text-sm text-[#6b7c76] hover:text-rose-700">
            Logout
          </button>
        }
      >
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-4xl text-[#1f3d36]">Company dashboard</h1>
            <p className="mt-1 text-[#5c6b66]">Himalaya Wellness · Talent pipeline</p>
            {newApplicantCount > 0 ? (
              <p className="mt-2 text-sm font-semibold text-[#8a6a2a]">
                {newApplicantCount} new {newApplicantCount === 1 ? 'student profile' : 'student profiles'} waiting for review
              </p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 lg:col-span-1">
            <h2 className="font-serif text-2xl text-[#1f3d36]">Post an internship</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                if (!newJob.role.trim()) return
                const posted = {
                  id: `job-${Date.now()}`,
                  title: newJob.role.trim(),
                  role: newJob.role.trim(),
                  company: newJob.company.trim() || 'Himalaya Wellness',
                  location: newJob.location.trim() || 'India',
                  description: newJob.description.trim(),
                  keywords: newJob.keywords.length > 0 ? newJob.keywords : ['Quality Control (QC) & Assay Testing'],
                  openings: 1,
                  applicants: 0,
                  postedByCompany: true,
                  tags: ['Company posting'],
                }
                setJobs((prev) => [posted, ...prev])
                apiPostCompanyJob(posted)
                setNewJob({ company: newJob.company, role: '', location: '', description: '', keywords: [] })
              }}
            >
              <input
                value={newJob.company}
                onChange={(e) => setNewJob((j) => ({ ...j, company: e.target.value }))}
                placeholder="Company name"
                className="w-full rounded-xl border border-[#d9d1c3] px-3 py-2.5 outline-none ring-[#2F5D50] focus:ring-2"
              />
              <input
                value={newJob.role}
                onChange={(e) => setNewJob((j) => ({ ...j, role: e.target.value }))}
                placeholder="Role title"
                required
                className="w-full rounded-xl border border-[#d9d1c3] px-3 py-2.5 outline-none ring-[#2F5D50] focus:ring-2"
              />
              <input
                value={newJob.location}
                onChange={(e) => setNewJob((j) => ({ ...j, location: e.target.value }))}
                placeholder="Location"
                className="w-full rounded-xl border border-[#d9d1c3] px-3 py-2.5 outline-none ring-[#2F5D50] focus:ring-2"
              />
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob((j) => ({ ...j, description: e.target.value }))}
                placeholder="Role description"
                rows={2}
                className="w-full rounded-xl border border-[#d9d1c3] px-3 py-2.5 outline-none ring-[#2F5D50] focus:ring-2"
              />

              {/* Industry Keywords Multi-Select for Company */}
              <div>
                <label className="block text-xs font-semibold text-[#1f3d36] mb-1">
                  Tag Industry Keywords (Matches students):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto rounded-xl border border-[#d9d1c3] bg-[#faf8f3] p-2.5">
                  {INDUSTRY_KEYWORDS.map((kw) => {
                    const isSelected = (newJob.keywords || []).includes(kw)
                    return (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => {
                          setNewJob((j) => {
                            const cur = j.keywords || []
                            const next = cur.includes(kw) ? cur.filter((k) => k !== kw) : [...cur, kw]
                            return { ...j, keywords: next }
                          })
                        }}
                        className={`rounded-lg px-2 py-1 text-xs text-left transition ${
                          isSelected
                            ? 'bg-[#8a6a2a] text-white font-medium shadow-xs'
                            : 'border border-[#d9d1c3] bg-white text-[#4d5e59] hover:border-[#8a6a2a]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {kw}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-1 text-[11px] text-[#6b7c76]">
                  {(newJob.keywords || []).length} keywords selected.
                </p>
              </div>

              <button type="submit" className="w-full rounded-xl bg-[#8a6a2a] py-2.5 font-semibold text-white">
                Publish role
              </button>
              <p className="text-xs text-[#6b7c76]">Students with at least 1 matching keyword will see this role.</p>
            </form>
          </div>
          <div className="space-y-4 lg:col-span-2">
            {jobs.map((job) => (
              <div key={job.id || job.title} className="rounded-2xl border border-[#e4ddd0] bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#1f3d36]">{job.role || job.title}</h3>
                    <p className="text-sm text-[#5c6b66]">
                      {job.company} · {job.location || 'India'} · {job.openings || 1} openings · {job.applicants || 0} applicants
                    </p>
                  </div>
                  <span className="rounded-full bg-[#e8f0ec] px-3 py-1 text-sm font-medium text-[#2F5D50]">Visible to matched students</span>
                </div>
                {job.keywords && job.keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#e4ddd0]/60 pt-2.5">
                    {job.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-[#faf8f3] border border-[#d9d1c3] px-2.5 py-0.5 text-xs text-[#2F5D50] font-medium"
                      >
                        🏷️ {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="rounded-2xl border border-[#e4ddd0] bg-[#faf8f3] p-5">
              <h3 className="font-semibold text-[#1f3d36]">Students who applied</h3>
              {newApplicantCount > 0 ? (
                <p className="mt-1 text-sm text-[#8a6a2a]">New profiles appear at the top as soon as a student applies.</p>
              ) : null}
              {sortedApplications.length === 0 ? (
                <p className="mt-1 text-sm text-[#5c6b66]">No applications yet. When a student clicks Apply, they appear here with resume and test report.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {sortedApplications.map((app) => {
                    const person = app.student || student
                    const appKey = app.id || app.jobId
                    const open = openApplicant === appKey
                    const rejected = app.status === 'Rejected'
                    return (
                      <li
                        key={appKey}
                        className={`rounded-xl p-4 text-sm ${
                          rejected
                            ? 'bg-[#f8eaea] ring-1 ring-rose-200'
                            : app.isNew
                              ? 'bg-white ring-2 ring-[#e8c07a]'
                              : 'bg-white'
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-[#1f3d36]">{person.name}</p>
                              {app.isNew && !rejected ? (
                                <span className="rounded-full bg-[#e8c07a] px-2 py-0.5 text-xs font-semibold text-[#3a2c10]">
                                  New profile
                                </span>
                              ) : null}
                              {rejected ? (
                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                                  Rejected
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[#5c6b66]">{person.contact || 'No phone provided'}</p>
                            <p className="text-sm text-[#1f3d36] font-medium mt-0.5">
                              🏛️ {person.college || 'College not specified'} · 🎓 {person.studyYear || 'Year not specified'}
                            </p>
                            <p className="text-[#5c6b66]">
                              {app.role} · {app.company}
                            </p>
                            <p className="mt-1 text-xs text-[#8a6a2a]">
                              {app.status} · {app.appliedAt}
                              {app.rejectedAt ? ` · Rejected ${app.rejectedAt}` : ''}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenApplicant(open ? null : appKey)
                                if (!open) markApplicantSeen(appKey)
                              }}
                              className="rounded-xl bg-[#2F5D50] px-4 py-2 font-semibold text-white"
                            >
                              {open ? 'Hide report' : 'View resume & report'}
                            </button>
                            {!rejected ? (
                              <button
                                type="button"
                                onClick={() => rejectApplicant(appKey)}
                                className="rounded-xl border border-rose-300 bg-white px-4 py-2 font-semibold text-rose-700 hover:bg-rose-50"
                              >
                                Reject profile
                              </button>
                            ) : null}
                          </div>
                        </div>
                        {open ? (
                          <div className="mt-4 border-t border-[#e4ddd0] pt-4">
                            <p className="font-medium text-[#1f3d36]">Academic Profile</p>
                            <div className="mt-1 text-sm text-[#5c6b66] space-y-0.5">
                              <p>🏛️ College: <span className="font-semibold text-[#1f3d36]">{person.college || 'Not specified'}</span></p>
                              <p>🎓 Year of Study: <span className="font-semibold text-[#1f3d36]">{person.studyYear || 'Not specified'}</span></p>
                            </div>

                            <div className="mt-3">
                              <p className="font-medium text-[#1f3d36]">Applicant's Industry Keywords:</p>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {(person.keywords || []).length === 0 ? (
                                  <span className="text-xs text-[#6b7c76]">No keywords selected</span>
                                ) : (
                                  (person.keywords || []).map((kw) => {
                                    const isMatched = (app.matchedKeywords || []).includes(kw) ||
                                      (jobs.find((j) => j.id === app.jobId)?.keywords || []).includes(kw)
                                    return (
                                      <span
                                        key={kw}
                                        className={`rounded-full px-2.5 py-0.5 text-xs ${
                                          isMatched
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}
                                      >
                                        {isMatched ? `✓ ${kw} (Matched)` : kw}
                                      </span>
                                    )
                                  })
                                )}
                              </div>
                            </div>

                            <p className="mt-4 font-medium text-[#1f3d36]">Resume</p>
                            {person.resumeData ? (
                              <a
                                href={person.resumeData}
                                download={person.resumeName || 'resume.pdf'}
                                className="mt-1 inline-block font-semibold text-[#2F5D50] underline"
                              >
                                Download {person.resumeName || 'resume.pdf'}
                              </a>
                            ) : (
                              <p className="mt-1 text-[#5c6b66]">
                                {person.resumeName ? `${person.resumeName} (file not stored — ask student to re-upload)` : 'No resume uploaded yet'}
                              </p>
                            )}
                            <p className="mt-4 font-medium text-[#1f3d36]">Test report</p>
                            <p className="mt-1 text-[#5c6b66]">Interest: {person.interest || 'Not specified'}</p>
                            <p className="text-[#5c6b66]">
                              Foundation: {app.foundation ? `${app.foundation.percent}% (${app.foundation.correct}/${app.foundation.total})` : 'Not taken'}
                            </p>
                            <p className="text-[#5c6b66]">
                              Specialization: {app.specialization ? `${app.specialization.percent}% (${app.specialization.correct}/${app.specialization.total})` : 'Not taken'}
                            </p>
                            <p className="text-[#5c6b66]">Overall readiness: {app.overall != null ? `${app.overall}%` : 'Complete both tests'}</p>
                            <ResponseList title="Foundation answers" questions={FOUNDATION_QUESTIONS} result={app.foundation} />
                            <ResponseList title="Specialization answers" questions={app.specialization?.questions || SPECIALIZATION_QUESTIONS} result={app.specialization} />
                          </div>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Shell>
    )
  }

  if (view === 'skillBridgePage') {
    return (
      <Shell
        onHome={() => setView('studentDashboard')}
        onBack={() => setView('studentDashboard')}
        backLabel="Back to dashboard"
        right={
          <button type="button" onClick={handleStudentLogout} className="text-sm text-[#6b7c76] hover:text-rose-700">
            Logout
          </button>
        }
      >
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#e8c07a] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#3a2c10]">
              Flagship USP
            </span>
            <span className="text-xs font-semibold text-[#8a6a2a]">
              Personalized Career Accelerator
            </span>
          </div>
          <h1 className="mt-2 font-serif text-4xl text-[#1f3d36] font-bold flex items-center gap-2">
            <span>🌉</span> Skill Bridge™ Hub
          </h1>
          <p className="mt-2 text-sm text-[#5c6b66] max-w-3xl leading-relaxed">
            Bridge the industry domains where you currently lack exposure. Explore company-backed bridging internships, connect 1-on-1 with senior industry mentors, and follow accredited certification courses.
          </p>
        </div>

        {/* Identified Gaps Banner */}
        <div className="mb-8 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50/50 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="font-serif text-lg font-bold text-[#1f3d36]">
                  {unselectedKeywords.length} Unselected Industry Skill Gaps Identified
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#5c6b66]">
                These are the crucial AYUSH industry competencies not present in your profile. Select any domain below to view targeted bridging resources:
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView('studentDashboard')}
              className="self-start sm:self-auto rounded-xl border border-[#8a6a2a] bg-white px-4 py-2 text-xs font-semibold text-[#8a6a2a] hover:bg-amber-50 transition shadow-2xs"
            >
              Edit Keywords on Dashboard ↗
            </button>
          </div>

          <div className="mt-3.5 flex flex-wrap gap-2">
            {unselectedKeywords.length === 0 ? (
              <span className="rounded-lg bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-800">
                🎉 Zero Gaps Detected! You have selected all 10 industry keywords.
              </span>
            ) : (
              unselectedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs"
                >
                  <span>⚠️</span>
                  <span>{kw}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* The 3 Separate Buttons */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8a6a2a] mb-2.5">
            Choose Your Skill Gap Remediation Pathway:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <button
              type="button"
              onClick={() => setSkillBridgeTab('internships')}
              className={`flex items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm font-semibold transition ${
                skillBridgeTab === 'internships'
                  ? 'bg-[#2F5D50] text-white shadow-lg ring-2 ring-[#2F5D50]'
                  : 'border border-[#d9d1c3] bg-white text-[#1f3d36] hover:bg-[#e8f0ec]'
              }`}
            >
              <span className="text-xl">🏢</span>
              <span>1. Bridge Internships</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${skillBridgeTab === 'internships' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {gapInternships.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSkillBridgeTab('mentors')}
              className={`flex items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm font-semibold transition ${
                skillBridgeTab === 'mentors'
                  ? 'bg-[#2F5D50] text-white shadow-lg ring-2 ring-[#2F5D50]'
                  : 'border border-[#d9d1c3] bg-white text-[#1f3d36] hover:bg-[#e8f0ec]'
              }`}
            >
              <span className="text-xl">👨‍🏫</span>
              <span>2. Assigned Mentors</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${skillBridgeTab === 'mentors' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {gapMentors.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSkillBridgeTab('courses')}
              className={`flex items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm font-semibold transition ${
                skillBridgeTab === 'courses'
                  ? 'bg-[#2F5D50] text-white shadow-lg ring-2 ring-[#2F5D50]'
                  : 'border border-[#d9d1c3] bg-white text-[#1f3d36] hover:bg-[#e8f0ec]'
              }`}
            >
              <span className="text-xl">📚</span>
              <span>3. Certified Courses</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${skillBridgeTab === 'courses' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {gapCourses.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: BRIDGE INTERNSHIPS */}
        {skillBridgeTab === 'internships' && (
          <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xs">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e4ddd0] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1f3d36]">
                  Dedicated Bridging Internships
                </h3>
                <p className="mt-1 text-xs text-[#5c6b66]">
                  Premier ASU companies offering hands-on learning trainee positions specifically in your unselected domains.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-[#2F5D50]">
                {gapInternships.length} opportunities available
              </span>
            </div>

            {gapInternships.length === 0 ? (
              <p className="text-sm text-[#6b7c76] py-8 text-center">No gap internships needed — you have covered all keywords!</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {gapInternships.map((job) => {
                  const isApplied = appliedGapJobs.includes(job.id)
                  return (
                    <div key={job.id} className="flex flex-col justify-between rounded-2xl border border-[#e4ddd0] bg-[#faf8f3] p-5 shadow-xs hover:border-[#2F5D50] transition">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="inline-block rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                              🎯 Bridges: {job.keyword}
                            </span>
                            <h4 className="mt-2 font-serif text-lg font-bold text-[#1f3d36]">{job.role}</h4>
                            <p className="text-xs font-semibold text-[#2F5D50]">{job.company} · {job.location}</p>
                          </div>
                          <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-[#2F5D50] whitespace-nowrap">
                            {job.stipend}
                          </span>
                        </div>
                        <p className="mt-2.5 text-xs text-[#5c6b66] leading-relaxed">{job.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {job.tags.map((t) => (
                            <span key={t} className="rounded-md bg-white border border-[#d9d1c3] px-2 py-0.5 text-[10px] text-gray-700">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#e4ddd0] flex items-center justify-between">
                        <span className="text-[11px] text-[#6b7c76]">Duration: {job.duration}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isApplied) {
                              setAppliedGapJobs((prev) => [...prev, job.id])
                              submitJobApplication(job.id, job.role, job.company, student)
                            }
                          }}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                            isApplied
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'bg-[#8a6a2a] text-white hover:bg-[#6f5420]'
                          }`}
                        >
                          {isApplied ? '✓ Application Sent' : 'Apply to Bridge Gap'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ASSIGNED MENTORS */}
        {skillBridgeTab === 'mentors' && (
          <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xs">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e4ddd0] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1f3d36]">
                  Assigned Industry Mentors
                </h3>
                <p className="mt-1 text-xs text-[#5c6b66]">
                  Senior industry directors and research heads assigned for each missing domain to provide 1-on-1 career guidance.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-[#2F5D50]">
                {gapMentors.length} mentors available
              </span>
            </div>

            {gapMentors.length === 0 ? (
              <p className="text-sm text-[#6b7c76] py-8 text-center">No mentors needed — you have covered all keywords!</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {gapMentors.map((m) => {
                  const isBooked = bookedMentors.includes(m.id)
                  return (
                    <div key={m.id} className="flex flex-col justify-between rounded-2xl border border-[#e4ddd0] bg-[#faf8f3] p-5 shadow-xs hover:border-[#2F5D50] transition">
                      <div>
                        <span className="inline-block rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                          🎓 Dedicated Mentor for: {m.keyword}
                        </span>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-xs border border-[#e4ddd0]">
                            {m.avatar}
                          </span>
                          <div>
                            <h4 className="font-serif text-base font-bold text-[#1f3d36]">{m.name}</h4>
                            <p className="text-xs text-[#5c6b66]">{m.title}</p>
                            <p className="text-[11px] font-semibold text-[#8a6a2a]">{m.organization}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-[#4d5e59] leading-relaxed">{m.bio}</p>
                        <div className="mt-3 rounded-lg bg-white p-2.5 border border-[#e4ddd0]">
                          <p className="text-[11px] font-semibold text-[#1f3d36]">Consultation Topics:</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {m.topics.map((top) => (
                              <span key={top} className="rounded-md bg-[#faf8f3] border border-[#d9d1c3] px-2 py-0.5 text-[10px] text-[#2F5D50]">
                                ✓ {top}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#e4ddd0] flex items-center justify-between">
                        <span className="text-[11px] text-[#6b7c76]">{m.experience}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isBooked) {
                              setBookedMentors((prev) => [...prev, m.id])
                              bookMentorSession({
                                mentorId: m.id,
                                mentorName: m.name,
                                keyword: m.keyword,
                                organization: m.organization,
                              }, student)
                            }
                            setMentorModal(m)
                          }}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                            isBooked
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'bg-[#2F5D50] text-white hover:bg-[#254a41]'
                          }`}
                        >
                          {isBooked ? '✓ 1-on-1 Scheduled' : 'Connect with Mentor'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CERTIFIED COURSES */}
        {skillBridgeTab === 'courses' && (
          <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xs">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e4ddd0] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1f3d36]">
                  Certified Courses & Study Guides
                </h3>
                <p className="mt-1 text-xs text-[#5c6b66]">
                  Accredited government and university certificates tailored to master each of your missing domains.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-[#2F5D50]">
                {gapCourses.length} courses curated
              </span>
            </div>

            {gapCourses.length === 0 ? (
              <p className="text-sm text-[#6b7c76] py-8 text-center">No courses needed — all keywords covered!</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {gapCourses.map((c) => (
                  <div key={c.id} className="flex flex-col justify-between rounded-2xl border border-[#e4ddd0] bg-[#faf8f3] p-5 shadow-xs hover:border-[#2F5D50] transition">
                    <div>
                      <span className="inline-block rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                        📖 Bridging Course: {c.keyword}
                      </span>
                      <h4 className="mt-2 font-serif text-base font-bold text-[#1f3d36]">{c.title}</h4>
                      <p className="mt-1 text-xs font-semibold text-[#8a6a2a]">{c.provider}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-[#5c6b66]">
                        <span>⏱️ {c.duration}</span>
                        <span>·</span>
                        <span>🎖️ {c.certification}</span>
                      </div>
                      <div className="mt-3 rounded-lg bg-white p-2.5 border border-[#e4ddd0]">
                        <p className="text-[11px] font-semibold text-[#1f3d36]">Syllabus Guide & Modules:</p>
                        <p className="mt-1 text-xs text-[#4d5e59] leading-relaxed">{c.guideOverview}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#e4ddd0] flex items-center justify-between">
                      <span className="text-[11px] text-[#6b7c76]">Level: {c.level}</span>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => apiEnrollCourse(c.id, c.title)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#2F5D50] px-4 py-2 text-xs font-semibold text-white hover:bg-[#254a41] transition"
                      >
                        <span>Enroll & View Guide</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mentor Consultation Booking Modal */}
        {mentorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setMentorModal(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
              >
                ✕
              </button>

              <div className="flex items-center gap-3.5">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f0ec] text-3xl shadow-xs">
                  {mentorModal.avatar}
                </span>
                <div>
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                    ✓ 1-on-1 Guidance Scheduled
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1f3d36] mt-1">{mentorModal.name}</h3>
                  <p className="text-xs text-[#5c6b66]">{mentorModal.title}</p>
                  <p className="text-xs font-semibold text-[#8a6a2a]">{mentorModal.organization}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5">
                <p className="text-xs font-bold text-amber-900">
                  🎯 Bridging Missing Keyword: {mentorModal.keyword}
                </p>
                <p className="mt-1 text-xs text-[#4d5e59] leading-relaxed">
                  {mentorModal.bio}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-[#1f3d36]">Scheduled Guidance Topics:</p>
                <div className="mt-2 space-y-2">
                  {(mentorModal.topics || []).map((topic, i) => (
                    <div key={topic} className="flex items-center gap-2 rounded-lg bg-[#faf8f3] border border-[#e4ddd0] p-2.5 text-xs text-[#2F5D50]">
                      <span className="font-bold text-emerald-600">✓</span>
                      <span><strong>Module {i + 1}:</strong> {topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-[#faf8f3] p-3.5 border border-[#e4ddd0] text-xs text-[#5c6b66]">
                <p className="font-semibold text-[#1f3d36]">📅 Session Format: 45-min Live Video Guidance (Google Meet)</p>
                <p className="mt-0.5">
                  Calendar invite and preparation checklist sent to: <span className="font-semibold text-[#2F5D50]">{student.email || 'your registered email'}</span>
                </p>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMentorModal(null)}
                  className="w-full sm:w-auto rounded-xl bg-[#2F5D50] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#254a41] transition shadow-xs"
                >
                  Done / Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Shell>
    )
  }

  if (view === 'reportPage') {
    const domainScores = [
      { name: 'GMP & Schedule T Compliance', score: skillLevel('GMP', foundation, specialization) },
      { name: 'Pharmacognosy & Raw Materials', score: skillLevel('Pharmacognosy', foundation, specialization) },
      { name: 'Quality Control (QC) & Testing', score: skillLevel('QC testing', foundation, specialization) },
      { name: 'Formulation R&D & Pharmaceutics', score: skillLevel('Formulations', foundation, specialization) },
      { name: 'Regulatory & Batch Documentation', score: skillLevel('Documentation', foundation, specialization) },
      { name: 'Clinical Diagnosis & Patient Care', score: skillLevel('Patient care', foundation, specialization) },
    ]

    return (
      <Shell
        onHome={() => setView('studentDashboard')}
        onBack={() => setView('studentDashboard')}
        backLabel="Back to dashboard"
        right={
          <button type="button" onClick={handleStudentLogout} className="text-sm text-[#6b7c76] hover:text-rose-700">
            Logout
          </button>
        }
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#2F5D50] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              Official Evaluation
            </span>
            <span className="text-xs font-semibold text-[#8a6a2a]">
              Competency Assessment & Diagnostic Report
            </span>
          </div>
          <h1 className="mt-2 font-serif text-4xl text-[#1f3d36] font-bold flex items-center gap-2">
            <span>📊</span> Competency Report Card & Analytics
          </h1>
          <p className="mt-2 text-sm text-[#5c6b66] max-w-3xl leading-relaxed">
            Detailed performance diagnostics, visual industry readiness charts, and domain-by-domain evaluation based on your completed tests.
          </p>
        </div>

        {/* Visual Graph & Analytics Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Circular Gauge Meter Card */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xs text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a6a2a] mb-2">
              Industry Readiness Index
            </span>
            <div className="relative flex items-center justify-center my-2">
              <svg className="w-44 h-44 transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="68"
                  stroke="#f0ece1"
                  strokeWidth="14"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="68"
                  stroke={overall >= 80 ? '#10b981' : overall >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="14"
                  strokeDasharray={427.26}
                  strokeDashoffset={427.26 * (1 - (overall || 0) / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-serif text-4xl font-bold text-[#1f3d36]">{overall}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a6a2a] mt-0.5">Readiness</span>
              </div>
            </div>

            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
              overall >= 80
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : overall >= 60
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              {overall >= 80 ? '🌟 Highly Industry-Ready' : overall >= 60 ? '👍 Good Industry Competency' : '📈 Developing Competence'}
            </span>
            <p className="mt-2 text-xs text-[#5c6b66] max-w-xs leading-relaxed">
              Derived from your Common Foundation Aptitude and Specialization track assessment performance.
            </p>
          </div>

          {/* Comparative Assessment Bars Card */}
          <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#e4ddd0] pb-3 mb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1f3d36]">
                    Assessment Performance Graph
                  </h3>
                  <p className="text-xs text-[#5c6b66]">
                    Benchmarking your test scores against the industry 100% standard.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#2F5D50] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {Number(Boolean(foundation)) + Number(Boolean(specialization))}/2 Tests Taken
                </span>
              </div>

              <div className="space-y-4">
                {/* Foundation Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#1f3d36] mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#2F5D50]"></span>
                      Common Foundation Aptitude
                    </span>
                    <span className="font-bold text-[#2F5D50]">
                      {foundation?.percent ?? 0}% ({foundation?.correct ?? 0}/{foundation?.total ?? 0} Correct)
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-[#faf8f3] overflow-hidden p-0.5 border border-[#d9d1c3]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2F5D50] to-emerald-500 transition-all duration-700"
                      style={{ width: `${Math.max(4, foundation?.percent || 0)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Track Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#1f3d36] mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#8a6a2a]"></span>
                      {activeSpecialization ? activeSpecialization.title : 'Specialization Track'}
                    </span>
                    <span className="font-bold text-[#8a6a2a]">
                      {specialization ? `${specialization.percent}% (${specialization.correct}/${specialization.total} Correct)` : 'Not taken yet'}
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-[#faf8f3] overflow-hidden p-0.5 border border-[#d9d1c3]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8a6a2a] to-amber-500 transition-all duration-700"
                      style={{ width: `${Math.max(4, specialization?.percent || 0)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Industry Target Standard */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#6b7c76] mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                      Target Industry Hiring Benchmark
                    </span>
                    <span className="font-bold text-blue-700">100% Target</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-[#faf8f3] overflow-hidden p-0.5 border border-[#d9d1c3]">
                    <div
                      className="h-full rounded-full bg-blue-400 opacity-60"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#faf8f3] p-3.5 border border-[#e4ddd0] text-xs text-[#4d5e59]">
              <p>
                <strong>Diagnostic Summary:</strong> Strongest area is{' '}
                <strong className="text-[#2F5D50]">
                  {specialization && specialization.percent >= (foundation?.percent || 0) ? activeSpecialization?.shortTitle : 'Common Foundation Aptitude'}
                </strong>.
                Recommended practical focus: Schedule T documentation rigor, batch manufacturing records, and raw botanical authentication.
              </p>
            </div>
          </div>
        </div>

        {/* Domain Competency Multi-Bar Graph */}
        <div className="mb-8 rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e4ddd0] pb-4 mb-5">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1f3d36]">
                Core AYUSH Competency Pillars Graph
              </h3>
              <p className="text-xs text-[#5c6b66]">
                Specific breakdown across essential industry skill areas tested in your assessments.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8a6a2a]">
              6 Key Competencies Analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domainScores.map((domain) => {
              const isHigh = domain.score >= 75
              const isMedium = domain.score >= 50
              return (
                <div key={domain.name} className="rounded-xl border border-[#e4ddd0] bg-[#faf8f3] p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[#1f3d36]">{domain.name}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      isHigh ? 'bg-emerald-100 text-emerald-800' : isMedium ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {domain.score}% · {isHigh ? 'Ready' : isMedium ? 'Proficient' : 'Needs Bridge'}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white overflow-hidden border border-[#d9d1c3]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-emerald-600' : isMedium ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(5, domain.score)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Missing Keywords Diagnosis Box */}
        <div className="mb-8 rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-serif text-xl font-bold text-[#1f3d36]">
                  Missing Industry Keywords ({unselectedKeywords.length} Detected)
                </h3>
              </div>
              <p className="mt-1.5 text-xs text-[#5c6b66] max-w-2xl leading-relaxed">
                Based on your profile and test diagnostics, you currently lack industry exposure in these {unselectedKeywords.length} domains. Use our dedicated Skill Bridge page to bridge each missing domain with internships, mentors, and accredited courses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView('skillBridgePage')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#8a6a2a] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#6f5420] transition whitespace-nowrap transform hover:-translate-y-0.5"
            >
              <span>🌉 Bridge in Skill Bridge Page</span>
              <span>→</span>
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {unselectedKeywords.length === 0 ? (
              <span className="rounded-lg bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-800">
                🎉 Fantastic! Zero keyword gaps — you have selected and covered all 10 industry keywords.
              </span>
            ) : (
              unselectedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs"
                >
                  <span>⚠️</span>
                  <span>{kw}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Detailed Question-by-Question Diagnostics */}
        <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xs">
          <div className="border-b border-[#e4ddd0] pb-4 mb-6">
            <h3 className="font-serif text-2xl font-bold text-[#1f3d36]">
              Question-by-Question Diagnostic Answers
            </h3>
            <p className="text-xs text-[#5c6b66] mt-0.5">
              Review your submitted answers, correct options, and clinical/industrial rationales.
            </p>
          </div>

          <div className="space-y-6">
            <ResponseList title="Common Foundation Aptitude Answers" questions={FOUNDATION_QUESTIONS} result={foundation} />
            {activeSpecialization && (
              <ResponseList
                title={`${activeSpecialization.title} Answers`}
                questions={activeSpecialization.questions}
                result={specialization}
              />
            )}
          </div>
        </div>
      </Shell>
    )
  }

  if (view === 'companyJobsPage') {
    return (
      <Shell
        onHome={() => setView('studentDashboard')}
        onBack={() => setView('studentDashboard')}
        backLabel="Back to dashboard"
        right={
          <button type="button" onClick={handleStudentLogout} className="text-sm text-[#6b7c76] hover:text-rose-700">
            Logout
          </button>
        }
      >
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#2F5D50] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                Company Job Board
              </span>
              <span className="text-xs font-semibold text-[#8a6a2a]">
                Verified Industry Internships
              </span>
            </div>
            <h1 className="mt-2 font-serif text-4xl text-[#1f3d36] font-bold flex items-center gap-2">
              <span>🏢</span> Apply for Companies
            </h1>
            <p className="mt-1 text-sm text-[#5c6b66] max-w-2xl">
              Roles from premier ASU healthcare & manufacturing partners matched against your selected industry keywords.
            </p>
          </div>
          {hasEnoughKeywords && (
            <div className="rounded-2xl bg-[#e8f0ec] border border-[#2F5D50]/20 p-4 text-center">
              <span className="text-xs text-[#5c6b66]">Matching Opportunities</span>
              <p className="font-serif text-3xl font-bold text-[#2F5D50]">{matchedInternships.length}</p>
            </div>
          )}
        </div>

        {/* Keyword Filter & Validation Section */}
        {!hasEnoughKeywords ? (
          <div className="rounded-2xl border-2 border-dashed border-[#d9d1c3] bg-white p-10 text-center shadow-xs">
            <span className="text-5xl">🔒</span>
            <h3 className="mt-3 font-serif text-2xl font-bold text-[#1f3d36]">
              Company Internships Locked
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5c6b66] leading-relaxed">
              To discover and apply for matching company internships, you must select a minimum of 3 industry keywords on your dashboard.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-800">
              <span>Currently selected: {(student.keywords || []).length} / 3 keywords</span>
              <span>·</span>
              <span>{3 - (student.keywords || []).length} more required to unlock</span>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setView('studentDashboard')}
                className="rounded-xl bg-[#2F5D50] px-6 py-3 text-sm font-semibold text-white hover:bg-[#254a41] shadow-sm transition"
              >
                Go to Dashboard to Select Keywords →
              </button>
            </div>
          </div>
        ) : matchedInternships.length === 0 ? (
          <div className="rounded-2xl border border-[#e4ddd0] bg-white p-10 text-center shadow-xs">
            <span className="text-5xl">🔍</span>
            <h3 className="mt-3 font-serif text-2xl font-bold text-[#1f3d36]">
              No Matching Company Internships Found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5c6b66] leading-relaxed">
              None of the active company roles match your currently chosen keywords. Please select additional keywords from the 10 industry keywords on the dashboard to expand your opportunities.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setView('studentDashboard')}
                className="rounded-xl bg-[#2F5D50] px-6 py-3 text-sm font-semibold text-white hover:bg-[#254a41] shadow-sm transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Selected Keywords Pill Bar */}
            <div className="rounded-xl border border-[#e4ddd0] bg-white p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#8a6a2a]">
                  Matching against your {(student.keywords || []).length} chosen industry keywords:
                </p>
                <button
                  type="button"
                  onClick={() => setView('studentDashboard')}
                  className="text-xs font-semibold text-[#2F5D50] hover:underline"
                >
                  Edit Keywords on Dashboard ↗
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(student.keywords || []).map((kw) => (
                  <span
                    key={kw}
                    className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-900"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* List of Matching Company Internships */}
            <div className="space-y-4">
              {matchedInternships.map((job) => {
                const app = myApplications.find((a) => a.jobId === job.id)
                const applied = app && app.status !== 'Rejected'
                const rejected = app?.status === 'Rejected'
                const overlappingKeywords = (job.keywords || []).filter((k) => studentKeywords.includes(k))

                return (
                  <div
                    key={job.id}
                    className="flex flex-col gap-4 rounded-2xl bg-white p-6 border border-[#e4ddd0] shadow-xs sm:flex-row sm:items-start sm:justify-between hover:border-[#2F5D50] transition"
                  >
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          {overlappingKeywords.length} Keyword Match{overlappingKeywords.length === 1 ? '' : 'es'}
                        </span>
                        {job.fromCompanyPortal ? (
                          <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                            Verified Company Portal Posting
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-2 font-serif text-2xl font-bold text-[#1f3d36]">{job.role}</h3>
                      <p className="text-sm font-semibold text-[#2F5D50]">
                        {job.company} · {job.location}
                      </p>
                      {job.description ? (
                        <p className="mt-2 text-sm text-[#5c6b66] leading-relaxed">{job.description}</p>
                      ) : null}

                      {/* Keyword Alignment Tags */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-[#8a6a2a]">
                          Keyword Alignment:
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {(job.keywords || []).map((kw) => {
                            const isMatch = studentKeywords.includes(kw)
                            return (
                              <span
                                key={kw}
                                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                                  isMatch
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {isMatch ? `✓ ${kw}` : kw}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      {/* Match & Gap Share Analysis */}
                      {job.report ? (
                        <div className="mt-4 rounded-xl bg-[#faf8f3] p-4 border border-[#e4ddd0]">
                          <div className="flex items-center justify-between text-sm font-semibold text-[#1f3d36]">
                            <span>Readiness Alignment: {job.report.match}% Match</span>
                            <span className="text-rose-800">{job.report.unmatchedPercent}% Gap Remaining</span>
                          </div>
                          {job.report.missing.length ? (
                            <ul className="mt-2.5 space-y-1 text-xs text-rose-800">
                              {job.report.missing.map((row) => (
                                <li key={row.skill}>
                                  • {row.skill}: Your score {row.you}% / Company target 100% · {row.gapShare}% gap share
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1.5 text-xs text-[#2F5D50] font-semibold">All listed requirements for this role are fulfilled!</p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl border border-dashed border-[#d9d1c3] bg-[#faf8f3] p-3 text-xs">
                          <p className="font-semibold text-[#8a6a2a]">⚡ Match analysis locked</p>
                          <p className="mt-0.5 text-[#5c6b66]">
                            Complete both assessment tests to calculate your exact match score and view your skill roadmap.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-stretch gap-2.5 sm:items-end sm:min-w-44">
                      <button
                        type="button"
                        onClick={() => {
                          if (!analysisReady) {
                            setView('testsPage')
                          } else {
                            setRoadmapJobId(job.id)
                            setView('roadmap')
                          }
                        }}
                        className={`rounded-xl border px-5 py-2.5 text-xs font-semibold transition text-center ${
                          analysisReady
                            ? 'border-[#2F5D50] text-[#2F5D50] hover:bg-[#e8f0ec]'
                            : 'border-[#d9d1c3] bg-[#faf8f3] text-[#6b7c76] hover:bg-[#eae4d8]'
                        }`}
                      >
                        {analysisReady ? 'Open Skill Roadmap →' : 'Take Tests for Roadmap'}
                      </button>
                      <button
                        type="button"
                        disabled={applied}
                        onClick={() => applyToJob(job)}
                        className={`rounded-xl px-5 py-3 text-sm font-semibold transition shadow-xs text-center ${
                          applied
                            ? 'bg-[#e8f0ec] text-[#2F5D50] font-bold'
                            : rejected
                              ? 'bg-[#2F5D50] text-white hover:bg-[#254a41]'
                              : 'bg-[#2F5D50] text-white hover:bg-[#254a41]'
                        }`}
                      >
                        {applied ? '✓ Application Submitted' : rejected ? 'Apply Again' : 'Apply for Role'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* My Submitted Applications Tracker */}
            {myApplications.length > 0 && (
              <div className="mt-8 rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xs">
                <h3 className="font-serif text-xl font-bold text-[#1f3d36] mb-4">
                  My Active Applications ({myApplications.length})
                </h3>
                <div className="space-y-3">
                  {myApplications.map((app) => (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-[#faf8f3] p-4 border border-[#e4ddd0]">
                      <div>
                        <h4 className="font-semibold text-[#1f3d36]">{app.role}</h4>
                        <p className="text-xs text-[#5c6b66]">{app.company} · Applied on {app.appliedAt}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                        Status: {app.status || 'Applied'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Shell>
    )
  }

  return (
    <Shell
      onHome={() => setView('landing')}
      onBack={handleStudentLogout}
      backLabel="Back"
      right={
        <button type="button" onClick={handleStudentLogout} className="text-sm text-[#6b7c76] hover:text-rose-700">
          Logout
        </button>
      }
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-[#1f3d36]">Student dashboard</h1>
          <p className="mt-1 text-[#5c6b66]">Profile, assessments, and internship matches</p>
        </div>
        <button
          type="button"
          onClick={() => setView('testsPage')}
          className="inline-flex items-center gap-2.5 rounded-2xl bg-[#2F5D50] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#2F5D50]/20 transition hover:bg-[#254a41]"
        >
          <span>📝</span>
          <span>Tests</span>
          {!analysisReady ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8c07a] text-xs font-bold text-[#3a2c10]">
              !
            </span>
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-[#1f3d36]">
              ✓
            </span>
          )}
        </button>
      </div>

      {/* Specialization Selection (4 Tracks) - Default removed */}
      <div className="mb-8 rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8a6a2a]">Specialization Selection</span>
            <h2 className="font-serif text-2xl text-[#1f3d36]">Choose your specialization track</h2>
          </div>
          <p className="text-xs text-[#6b7c76]">
            {activeSpecialization ? 'Track selected · Click another to switch' : '⚠️ No track pre-selected · Please click your preferred track below'}
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPECIALIZATIONS.map((spec) => {
            const isSelected = activeSpecializationId === spec.id
            const hasScore = specializationScores[spec.id]
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => {
                  setStudent((prev) => ({
                    ...prev,
                    specialization: spec.id,
                    interest: spec.shortTitle,
                  }))
                }}
                className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition ${
                  isSelected
                    ? 'border-[#2F5D50] bg-[#e8f0ec]/60 shadow-md ring-2 ring-[#2F5D50]'
                    : 'border-[#e4ddd0] bg-[#faf8f3] hover:border-[#c9bfae] hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{spec.icon}</span>
                    {isSelected ? (
                      <span className="rounded-full bg-[#2F5D50] px-2.5 py-0.5 text-xs font-semibold text-white">
                        Selected ✓
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-[#6b7c76] group-hover:text-[#1f3d36]">
                        Select
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-[#1f3d36]">
                    {spec.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#5c6b66] leading-relaxed">
                    {spec.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e4ddd0]/70 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#8a6a2a]">Track Test</span>
                  {hasScore ? (
                    <span className="font-semibold text-[#2F5D50]">Score: {hasScore.percent}%</span>
                  ) : (
                    <span className="text-[#888]">Not taken</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Industry Keywords Section (Select minimum 3 from 10) */}
      <div className="mb-8 rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8a6a2a]">Industry Skill Alignment</span>
            <h2 className="font-serif text-2xl text-[#1f3d36]">Industry Keywords</h2>
            <p className="mt-1 text-sm text-[#5c6b66]">
              Select keywords reflecting your core competencies. Minimum 3 required to unlock company job postings.
            </p>
          </div>
          <div>
            {(student.keywords || []).length < 3 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-semibold text-amber-900 border border-amber-300">
                <span>⚠️</span>
                <span>{(student.keywords || []).length}/10 selected · Pick at least {3 - (student.keywords || []).length} more</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-semibold text-emerald-900 border border-emerald-300">
                <span>✓</span>
                <span>{(student.keywords || []).length}/10 selected · Matching unlocked!</span>
              </span>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {INDUSTRY_KEYWORDS.map((kw) => {
            const isSelected = (student.keywords || []).includes(kw)
            return (
              <button
                key={kw}
                type="button"
                onClick={() => toggleStudentKeyword(kw)}
                className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isSelected
                    ? 'bg-[#2F5D50] text-white shadow-sm ring-2 ring-[#2F5D50]'
                    : 'border border-[#d9d1c3] bg-[#faf8f3] text-[#243833] hover:border-[#2F5D50] hover:bg-white'
                }`}
              >
                <span className={`text-xs ${isSelected ? 'text-[#e8c07a]' : 'text-[#8a6a2a]'}`}>
                  {isSelected ? '✓' : '+'}
                </span>
                <span>{kw}</span>
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-[#6b7c76]">
          {(student.keywords || []).length < 3
            ? '⚡ Company job listings remain locked until you choose at least 3 keywords.'
            : '🎉 Requirement fulfilled! Showing company jobs matching at least one of your chosen keywords below.'}
        </p>
      </div>

      {/* Skill Bridge USP Gateway Card */}
      <div className="mb-8 overflow-hidden rounded-2xl border-2 border-[#8a6a2a]/40 bg-white shadow-md">
        <div className="bg-gradient-to-r from-[#1f3d36] to-[#2F5D50] p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#e8c07a] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#3a2c10]">
                  Flagship USP
                </span>
                <span className="text-xs font-medium text-white/80">Personalized Career Accelerator</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-white font-bold flex items-center gap-2">
                <span>🌉</span> Skill Bridge™
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-[#e8f0ec] leading-relaxed">
                Before bridge: You currently lack behind in{' '}
                <strong className="text-[#e8c07a] font-semibold">{unselectedKeywords.length} key industry domains</strong> that you didn’t select.
                Bridge these gaps on our dedicated Skill Bridge page with targeted internships, 1-on-1 industry mentors, and certified guides!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView('skillBridgePage')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8c07a] px-6 py-4 text-sm font-bold text-[#3a2c10] shadow-lg transition hover:bg-[#dfb366] whitespace-nowrap transform hover:-translate-y-0.5"
            >
              <span>🌉 Open Skill Bridge Page</span>
              <span>→</span>
            </button>
          </div>

          {/* Gaps Teaser Chips */}
          <div className="mt-4 border-t border-white/15 pt-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e8c07a]">
                Identified Unselected Skill Gaps ({unselectedKeywords.length}):
              </p>
              <span className="text-xs text-emerald-200">
                3 separate remediation pathways available inside ↗
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {unselectedKeywords.length === 0 ? (
                <span className="text-xs text-emerald-200">
                  🎉 Fantastic! You have selected all 10 industry keywords — zero gaps detected.
                </span>
              ) : (
                unselectedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-black/25 border border-amber-300/40 px-2.5 py-1 text-xs text-amber-200"
                  >
                    ⚠️ {kw}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6">
          <h2 className="font-serif text-2xl text-[#1f3d36]">My profile</h2>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-[#6b7c76]">Name</p>
              <p className="text-lg font-semibold text-[#1f3d36]">{student.name || 'Student'}</p>
            </div>

            {/* College Name Input */}
            <div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#3d4f4a]">College / Institute Name</span>
                <input
                  type="text"
                  value={collegeInput}
                  onChange={(e) => {
                    setCollegeInput(e.target.value)
                    setProfileSaved(false)
                  }}
                  placeholder="e.g. Govt Ayurveda College, Jaipur"
                  className="w-full rounded-xl border border-[#d9d1c3] px-3 py-2 text-sm outline-none ring-[#2F5D50] focus:ring-2"
                />
              </label>
            </div>

            {/* Year of Study Input */}
            <div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#3d4f4a]">Year of Study / Passing Year</span>
                <select
                  value={studyYearInput}
                  onChange={(e) => {
                    setStudyYearInput(e.target.value)
                    setProfileSaved(false)
                  }}
                  className="w-full rounded-xl border border-[#d9d1c3] px-3 py-2 text-sm outline-none ring-[#2F5D50] focus:ring-2 bg-white"
                >
                  <option value="">Select Year of Study...</option>
                  <option value="1st Year (BAMS/BHMS/BUMS)">1st Year (BAMS/BHMS/BUMS)</option>
                  <option value="2nd Year (BAMS/BHMS/BUMS)">2nd Year (BAMS/BHMS/BUMS)</option>
                  <option value="3rd Year (BAMS/BHMS/BUMS)">3rd Year (BAMS/BHMS/BUMS)</option>
                  <option value="4th / Final Year (BAMS/BHMS/BUMS)">4th / Final Year (BAMS/BHMS/BUMS)</option>
                  <option value="Internship / Housemanship">Internship / Housemanship</option>
                  <option value="Post-Graduate (MD/MS AYUSH)">Post-Graduate (MD/MS AYUSH)</option>
                  <option value="Recent Graduate (Batch of 2025/2026)">Recent Graduate (Batch of 2025/2026)</option>
                </select>
              </label>
            </div>

            {/* Contact Details */}
            <div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#3d4f4a]">Contact details (Phone Number)</span>
                <input
                  type="tel"
                  value={contactInput}
                  onChange={(e) => {
                    setContactInput(e.target.value)
                    setProfileSaved(false)
                  }}
                  placeholder="Enter phone number (e.g. +91 98765 43210)"
                  className="w-full rounded-xl border border-[#d9d1c3] px-3 py-2 text-sm outline-none ring-[#2F5D50] focus:ring-2"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              className="w-full rounded-xl bg-[#2F5D50] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#254a41]"
            >
              Save Profile Details
            </button>
            {profileSaved ? (
              <p className="text-center text-xs font-semibold text-[#2F5D50]">✓ Profile details saved successfully!</p>
            ) : null}

            <div>
              <p className="text-sm text-[#6b7c76]">Specialization track</p>
              <p className="font-semibold text-[#1f3d36]">
                {activeSpecialization ? activeSpecialization.title : 'None selected (choose above)'}
              </p>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#3d4f4a]">Area of interest</span>
              <input
                type="text"
                value={student.interest}
                onChange={(e) => setStudent((s) => ({ ...s, interest: e.target.value }))}
                placeholder="e.g. Herbal Quality Control, Clinical R&D"
                className="w-full rounded-xl border border-[#d9d1c3] px-3 py-2 text-sm outline-none ring-[#2F5D50] focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#3d4f4a]">Upload resume (PDF)</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    setStudent((s) => ({
                      ...s,
                      resumeName: file.name,
                      resumeData: String(reader.result || ''),
                    }))
                  }
                  reader.readAsDataURL(file)
                }}
                className="w-full text-sm text-[#5c6b66] file:mr-3 file:rounded-full file:border-0 file:bg-[#e8f0ec] file:px-4 file:py-2 file:font-semibold file:text-[#2F5D50]"
              />
              {student.resumeName ? <p className="mt-2 text-xs text-[#2F5D50]">{student.resumeName} attached</p> : null}
            </label>
            <p className="text-xs text-[#6b7c76]">Profile and test answers auto-save on this device.</p>
          </div>
        </div>

        {/* Assessments & Internships Column */}
        <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e4ddd0] pb-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8a6a2a]">Assessments Overview</span>
              <h2 className="font-serif text-2xl text-[#1f3d36]">Skill assessments</h2>
              <p className="mt-1 text-sm text-[#5c6b66]">
                Assigned track: <span className="font-semibold text-[#1f3d36]">{activeSpecialization ? activeSpecialization.title : 'None selected (select a track above)'}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView('testsPage')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2F5D50] px-6 py-3 font-semibold text-white transition hover:bg-[#254a41] shadow-sm"
            >
              <span>📝</span> Go to Tests Page →
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#e4ddd0] bg-[#faf8f3] p-4">
              <span className="text-xs font-semibold text-[#8a6a2a]">1. Common Test</span>
              <h4 className="mt-1 font-semibold text-[#1f3d36]">Foundation Aptitude</h4>
              <p className="mt-2 text-sm">
                {foundation ? (
                  <span className="font-semibold text-[#2F5D50]">✓ Score: {foundation.percent}%</span>
                ) : (
                  <span className="text-rose-700 text-xs font-medium">⚠️ Not taken yet</span>
                )}
              </p>
            </div>
            <div className="rounded-xl border border-[#e4ddd0] bg-[#faf8f3] p-4">
              <span className="text-xs font-semibold text-[#8a6a2a]">2. Assigned Specialization</span>
              <h4 className="mt-1 font-semibold text-[#1f3d36]">
                {activeSpecialization ? activeSpecialization.shortTitle : 'No track selected'}
              </h4>
              <p className="mt-2 text-sm">
                {activeSpecialization ? (
                  specialization ? (
                    <span className="font-semibold text-[#2F5D50]">✓ Score: {specialization.percent}%</span>
                  ) : (
                    <span className="text-rose-700 text-xs font-medium">⚠️ Not taken yet</span>
                  )
                ) : (
                  <span className="text-amber-800 text-xs font-medium">⚠️ Track selection required</span>
                )}
              </p>
            </div>
          </div>

          {/* Gateway Card 1: Test Analysis & Report Card */}
          <div className="mt-8 rounded-2xl border border-[#e4ddd0] bg-[#faf8f3] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e4ddd0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <h3 className="font-serif text-xl font-bold text-[#1f3d36]">
                    Assessment Analysis & Report Card
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-[#5c6b66]">
                  Official competency report card, visual readiness graphs, and domain analytics.
                </p>
              </div>
              {analysisReady && (
                <span className="self-start sm:self-auto rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                  ✓ Assessment Ready
                </span>
              )}
            </div>

            {!analysisReady ? (
              <div className="mt-4 rounded-xl border border-dashed border-[#d9d1c3] bg-white p-5 text-center">
                <p className="text-sm italic text-[#5c6b66]">
                  Complete both the Foundation Aptitude and Specialization tests to generate your official report card and competency graphs.
                </p>
                <button
                  type="button"
                  onClick={() => setView('testsPage')}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#2F5D50] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#254a41] transition"
                >
                  <span>📝</span> Go to Tests Page →
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-[#2F5D50] p-4 text-white shadow-xs">
                    <p className="text-xs text-white/80">Overall Readiness</p>
                    <p className="font-serif text-3xl font-bold mt-1">{overall}%</p>
                    <p className="mt-1 text-[11px] text-emerald-200">
                      {overall >= 80 ? '🌟 Highly Ready' : overall >= 60 ? '👍 Competitive' : '📈 Developing'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-[#e4ddd0] p-4 shadow-xs">
                    <p className="text-xs text-[#6b7c76]">Foundation Score</p>
                    <p className="font-serif text-2xl font-bold text-[#1f3d36] mt-1">{foundation?.percent ?? 0}%</p>
                    <p className="mt-1 text-[11px] text-[#5c6b66]">
                      {foundation?.correct ?? 0}/{foundation?.total ?? 0} correct
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-[#e4ddd0] p-4 shadow-xs">
                    <p className="text-xs text-[#6b7c76]">{activeSpecialization?.shortTitle || 'Track'} Score</p>
                    <p className="font-serif text-2xl font-bold text-[#1f3d36] mt-1">{specialization?.percent ?? 0}%</p>
                    <p className="mt-1 text-[11px] text-[#5c6b66]">
                      {specialization?.correct ?? 0}/{specialization?.total ?? 0} correct
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-[#8a6a2a]/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#1f3d36]">
                      View Full Analysis & Visual Competency Graphs
                    </h4>
                    <p className="text-xs text-[#5c6b66] mt-0.5">
                      Explore the interactive circular gauge meter, domain pillar chart, missing keywords, and detailed answer diagnostics on a dedicated page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setView('reportPage')}
                    className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-[#8a6a2a] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#6f5420] transition whitespace-nowrap transform hover:-translate-y-0.5"
                  >
                    <span>📊 Open Full Report Page</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Gateway Card 2: Apply for Companies */}
          <div className="mt-6 rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e4ddd0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏢</span>
                  <h3 className="font-serif text-xl font-bold text-[#1f3d36]">
                    Apply for Companies
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-[#5c6b66]">
                  Verified internships from leading ASU manufacturers and clinics matching your keywords.
                </p>
              </div>
              {hasEnoughKeywords && (
                <span className="self-start sm:self-auto rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-[#2F5D50]">
                  {matchedInternships.length} role{matchedInternships.length === 1 ? '' : 's'} available
                </span>
              )}
            </div>

            {!hasEnoughKeywords ? (
              <div className="mt-5 rounded-xl border-2 border-dashed border-[#d9d1c3] bg-[#faf8f3] p-6 text-center">
                <span className="text-3xl">🔒</span>
                <h4 className="mt-2 font-serif text-lg font-bold text-[#1f3d36]">
                  Company Internships Locked
                </h4>
                <p className="mx-auto mt-1 max-w-md text-xs text-[#5c6b66] leading-relaxed">
                  Please select at least 3 industry keywords in the section above to discover matching company roles.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800">
                  <span>Currently selected: {(student.keywords || []).length} / 3 keywords</span>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-[#faf8f3] border border-[#e4ddd0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#1f3d36]">
                      {matchedInternships.length} Matching Company Internships Found
                    </h4>
                    <p className="text-xs text-[#5c6b66] mt-0.5">
                      Roles aligned with your {(student.keywords || []).length} keywords from companies like Himalaya Wellness, Patanjali, and Arya Vaidya Sala.
                    </p>
                    {myApplications.length > 0 && (
                      <p className="text-xs font-semibold text-[#2F5D50] mt-1.5">
                        ✓ You have applied to {myApplications.length} {myApplications.length === 1 ? 'role' : 'roles'}.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setView('companyJobsPage')}
                    className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-[#2F5D50] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#254a41] transition whitespace-nowrap transform hover:-translate-y-0.5"
                  >
                    <span>🏢 Open Apply for Companies Page</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

      {/* Mentor Consultation Booking Modal */}
      {mentorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setMentorModal(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f0ec] text-3xl shadow-xs">
                {mentorModal.avatar}
              </span>
              <div>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  ✓ 1-on-1 Guidance Scheduled
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1f3d36] mt-1">{mentorModal.name}</h3>
                <p className="text-xs text-[#5c6b66]">{mentorModal.title}</p>
                <p className="text-xs font-semibold text-[#8a6a2a]">{mentorModal.organization}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5">
              <p className="text-xs font-bold text-amber-900">
                🎯 Bridging Missing Keyword: {mentorModal.keyword}
              </p>
              <p className="mt-1 text-xs text-[#4d5e59] leading-relaxed">
                {mentorModal.bio}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-[#1f3d36]">Scheduled Guidance Topics:</p>
              <div className="mt-2 space-y-2">
                {(mentorModal.topics || []).map((topic, i) => (
                  <div key={topic} className="flex items-center gap-2 rounded-lg bg-[#faf8f3] border border-[#e4ddd0] p-2.5 text-xs text-[#2F5D50]">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>Module {i + 1}:</strong> {topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#faf8f3] p-3.5 border border-[#e4ddd0] text-xs text-[#5c6b66]">
              <p className="font-semibold text-[#1f3d36]">📅 Session Format: 45-min Live Video Guidance (Google Meet)</p>
              <p className="mt-0.5">
                Calendar invite and preparation checklist sent to: <span className="font-semibold text-[#2F5D50]">{student.email || 'your registered email'}</span>
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setMentorModal(null)}
                className="w-full sm:w-auto rounded-xl bg-[#2F5D50] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#254a41] transition shadow-xs"
              >
                Done / Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
