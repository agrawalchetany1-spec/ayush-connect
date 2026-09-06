import cors from 'cors'
import express from 'express'
import apiRoutes from './routes/api.js'

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`)
  next()
})

// Mount API routes under /api
app.use('/api', apiRoutes)

// Fallback route
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' })
})

app.listen(PORT, () => {
  console.log(`🌿 Ayush Connect Backend API is listening on http://localhost:${PORT}`)
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`)
})
