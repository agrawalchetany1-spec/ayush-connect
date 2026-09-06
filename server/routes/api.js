import { Router } from 'express'
import {
  bookMentor,
  getHealth,
  getUserData,
  resetData,
  saveAssessment,
  submitApplication,
  updateKeywords,
  updateUserData,
} from '../controllers/dataController.js'

const router = Router()

// Health check
router.get('/health', getHealth)

// Full user data retrieval & update
router.get('/user-data', getUserData)
router.post('/user-data', updateUserData)

// Specialized action endpoints
router.post('/keywords', updateKeywords)
router.post('/assessments', saveAssessment)
router.post('/applications', submitApplication)
router.post('/mentor-bookings', bookMentor)
router.post('/reset', resetData)

export default router
