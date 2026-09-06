import { Router } from 'express'
import {
  bookMentor,
  enrollCourse,
  getAssessmentReport,
  getHealth,
  getSkillBridgeGaps,
  getUserData,
  handleLogin,
  handleLogout,
  postCompanyJob,
  recordAnswer,
  resetData,
  saveAssessment,
  submitApplication,
  trackActivity,
  updateApplicationStatus,
  updateKeywords,
  updateProfile,
  updateUserData,
  uploadResume,
} from '../controllers/dataController.js'

const router = Router()

// Health check
router.get('/health', getHealth)

// Activity & navigation tracking
router.post('/activity', trackActivity)

// Auth endpoints
router.post('/login', handleLogin)
router.post('/logout', handleLogout)

// User profile & data
router.get('/user-data', getUserData)
router.post('/user-data', updateUserData)
router.post('/profile', updateProfile)
router.post('/resume', uploadResume)

// Assessments & Reports
router.post('/assessments', saveAssessment)
router.post('/assessments/answer', recordAnswer)
router.get('/assessments/report', getAssessmentReport)

// Skill Bridge & Keywords
router.get('/skill-bridge/gaps', getSkillBridgeGaps)
router.post('/keywords', updateKeywords)
router.post('/mentor-bookings', bookMentor)
router.post('/courses/enroll', enrollCourse)

// Applications & Company
router.post('/applications', submitApplication)
router.post('/applications/status', updateApplicationStatus)
router.post('/company/jobs', postCompanyJob)
router.post('/reset', resetData)

export default router
