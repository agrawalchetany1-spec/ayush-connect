import cors from 'cors'
import express from 'express'
import apiRoutes from './routes/api.js'

const app = express()
const PORT = process.env.PORT || 5001

// Middleware (50mb limit to handle resume PDFs and avoid 413 error)
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

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
