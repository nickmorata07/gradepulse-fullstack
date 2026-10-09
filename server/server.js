import express from 'express'
import cors from 'cors'
import { pool } from './db/pool.js'

const app = express()
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',').map((value) => value.trim()).filter(Boolean)
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true); return callback(new Error('Origin is not allowed by CORS')) } }))
app.use(express.json({ limit: '100kb' }))

app.get('/healthz', (_req, res) => res.json({ ok: true, service: 'GradePulse API' }))
app.get('/readyz', async (_req, res) => { try { await pool.query('SELECT 1'); res.json({ ok: true, database: 'connected' }) } catch (error) { console.error('Database readiness check failed:', error.message); res.status(503).json({ ok: false, database: 'unavailable' }) } })

const courseSelect = `SELECT c.id, c.course_code, c.course_name, c.target_grade, c.created_at,
  COALESCE((SELECT json_agg(json_build_object('id', cw.id, 'category_name', cw.category_name, 'weight_percentage', cw.weight_percentage, 'assessments', COALESCE((SELECT json_agg(json_build_object('id', a.id, 'item_name', a.item_name, 'score', a.score, 'max_score', a.max_score) ORDER BY a.created_at DESC) FROM assessment_scores a WHERE a.category_id = cw.id), '[]'::json))) FROM category_weights cw WHERE cw.course_id = c.id), '[]'::json) AS categories
  FROM courses c`

app.get('/api/courses', async (_req, res, next) => { try { const { rows } = await pool.query(`${courseSelect} ORDER BY c.created_at DESC`); res.json(rows) } catch (error) { next(error) } })
app.post('/api/courses', async (req, res, next) => {
  const courseCode = typeof req.body?.course_code === 'string' ? req.body.course_code.trim().toUpperCase() : ''
  const courseName = typeof req.body?.course_name === 'string' ? req.body.course_name.trim() : ''
  const targetGrade = Number(req.body?.target_grade)
  if (!courseCode || !courseName) return res.status(400).json({ error: 'Course code and course name are required.' })
  if (!Number.isFinite(targetGrade) || targetGrade < 0 || targetGrade > 100) return res.status(400).json({ error: 'Target grade must be between 0 and 100.' })
  try { const { rows } = await pool.query('INSERT INTO courses (course_code, course_name, target_grade) VALUES ($1, $2, $3) RETURNING *', [courseCode, courseName, targetGrade]); res.status(201).json({ ...rows[0], categories: [] }) } catch (error) { next(error) }
})
app.get('/api/courses/:id', async (req, res, next) => { try { const { rows } = await pool.query(`${courseSelect} WHERE c.id = $1`, [req.params.id]); if (!rows.length) return res.status(404).json({ error: 'Course not found.' }); res.json(rows[0]) } catch (error) { next(error) } })
app.delete('/api/courses/:id', async (req, res, next) => { try { const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id', [req.params.id]); if (!result.rowCount) return res.status(404).json({ error: 'Course not found.' }); res.status(204).end() } catch (error) { next(error) } })
app.post('/api/courses/:id/categories', async (req, res, next) => {
  const name = typeof req.body?.category_name === 'string' ? req.body.category_name.trim() : ''
  const weight = Number(req.body?.weight_percentage)
  if (!name) return res.status(400).json({ error: 'Category name is required.' })
  if (!Number.isFinite(weight) || weight <= 0 || weight > 100) return res.status(400).json({ error: 'Category weight must be greater than 0 and at most 100.' })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const course = await client.query('SELECT id FROM courses WHERE id = $1 FOR UPDATE', [req.params.id])
    if (!course.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Course not found.' }) }
    const total = await client.query('SELECT COALESCE(SUM(weight_percentage), 0) AS total FROM category_weights WHERE course_id = $1', [req.params.id])
    if (Number(total.rows[0].total) + weight > 100) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Category weights cannot total more than 100%.' }) }
    const result = await client.query('INSERT INTO category_weights (course_id, category_name, weight_percentage) VALUES ($1, $2, $3) RETURNING *', [req.params.id, name, weight])
    await client.query('COMMIT'); res.status(201).json({ ...result.rows[0], assessments: [] })
  } catch (error) { await client.query('ROLLBACK'); next(error) } finally { client.release() }
})
app.post('/api/categories/:id/assessments', async (req, res, next) => {
  const name = typeof req.body?.item_name === 'string' ? req.body.item_name.trim() : ''
  const score = Number(req.body?.score), maxScore = Number(req.body?.max_score)
  if (!name) return res.status(400).json({ error: 'Assessment name is required.' })
  if (!Number.isFinite(maxScore) || maxScore <= 0 || !Number.isFinite(score) || score < 0 || score > maxScore) return res.status(400).json({ error: 'Score must be between zero and the maximum score.' })
  try { const category = await pool.query('SELECT id FROM category_weights WHERE id = $1', [req.params.id]); if (!category.rowCount) return res.status(404).json({ error: 'Category not found.' }); const { rows } = await pool.query('INSERT INTO assessment_scores (category_id, item_name, score, max_score) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.id, name, score, maxScore]); res.status(201).json(rows[0]) } catch (error) { next(error) }
})

app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }))
app.use((error, _req, res, _next) => { console.error('API error:', error.message); if (error.message === 'Origin is not allowed by CORS') return res.status(403).json({ error: error.message }); res.status(500).json({ error: 'Unexpected server error. Check the server logs.' }) })

const port = Number(process.env.PORT) || 5000
const server = app.listen(port, () => console.log(`GradePulse API listening on http://localhost:${port}`))
async function shutdown() { server.close(async () => { await pool.end(); process.exit(0) }) }
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
