import { Router } from 'express'
import {
  bookMentor,
  enrollCourse,
  getHealth,
  getUserData,
  handleLogin,
  handleLogout,
  postCompanyJob,
  resetData,
  saveAssessment,
  submitApplication,
  updateApplicationStatus,
  updateKeywords,
  updateProfile,
  updateUserData,
  uploadResume,
} from '../controllers/dataController.js'

const router = Router()

// Health check
router.get('/health', getHealth)

// Auth endpoints
router.post('/login', handleLogin)
router.post('/logout', handleLogout)

// User profile & data
router.get('/user-data', getUserData)
router.post('/user-data', updateUserData)
router.post('/profile', updateProfile)
router.post('/resume', uploadResume)

// Specialized action endpoints
router.post('/keywords', updateKeywords)
router.post('/assessments', saveAssessment)
router.post('/applications', submitApplication)
router.post('/applications/status', updateApplicationStatus)
router.post('/mentor-bookings', bookMentor)
router.post('/courses/enroll', enrollCourse)
router.post('/company/jobs', postCompanyJob)
router.post('/reset', resetData)

export default router
