import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, '../data')
const menuPath = path.join(dataDir, 'menu.json')
const reservationsPath = path.join(dataDir, 'reservations.json')
const app = express()
const PORT = Number(process.env.PORT || 4000)
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: allowedOrigin }))
app.use(express.json({ limit: '30kb' }))

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')) }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error }
}
async function writeJson(file, data) {
  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8')
}
function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return false
  const parsed = new Date(`${date}T00:00:00`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0,10) === date
}
const timeSlots = ['12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM','9:00 PM']

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'maison-ember-api' }))
app.get('/api/menu', async (_req, res, next) => {
  try { res.json({ items: await readJson(menuPath, []) }) } catch (e) { next(e) }
})
app.get('/api/availability', async (req, res) => {
  const { date, guests = '2' } = req.query
  const count = Number(guests)
  if (!validDate(date) || !Number.isInteger(count) || count < 1 || count > 8) {
    return res.status(400).json({ error: 'Choose a valid date and party size between 1 and 8.' })
  }
  const reservations = await readJson(reservationsPath, [])
  const booked = new Set(reservations.filter(r => r.date === date && r.status !== 'cancelled').map(r => r.time))
  // Demo availability: deterministic busy slots based on date and party size.
  const offset = (Number(date.slice(-2)) + count) % timeSlots.length
  const slots = timeSlots.filter((slot, index) => !booked.has(slot) && (index + offset) % 5 !== 0)
  res.json({ date, guests: count, slots })
})
app.post('/api/reservations', async (req, res) => {
  const { date, time, guests, name, email, phone = '', notes = '' } = req.body || {}
  const count = Number(guests)
  if (!validDate(date)) return res.status(400).json({ error: 'Please choose a valid reservation date.' })
  if (!timeSlots.includes(time)) return res.status(400).json({ error: 'Please select an available time slot.' })
  if (!Number.isInteger(count) || count < 1 || count > 8) return res.status(400).json({ error: 'Party size must be between 1 and 8.' })
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) return res.status(400).json({ error: 'Please enter your name.' })
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' })
  if (typeof phone !== 'string' || phone.length > 30 || typeof notes !== 'string' || notes.length > 500) return res.status(400).json({ error: 'Please check your phone number or special requests.' })
  const reservations = await readJson(reservationsPath, [])
  if (reservations.some(r => r.date === date && r.time === time && r.status !== 'cancelled')) {
    return res.status(409).json({ error: 'That time was just taken in this demo. Please choose another time.' })
  }
  const reservation = {
    reference: `ME-${randomBytes(3).toString('hex').toUpperCase()}`,
    date, time, guests: count, name: name.trim(), email: email.trim().toLowerCase(),
    phone: phone.trim(), notes: notes.trim(), status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
  reservations.push(reservation)
  await writeJson(reservationsPath, reservations)
  res.status(201).json({ reservation })
})
app.get('/api/reservations/:reference', async (req, res) => {
  const reservations = await readJson(reservationsPath, [])
  const reservation = reservations.find(r => r.reference === req.params.reference)
  if (!reservation) return res.status(404).json({ error: 'Reservation not found.' })
  res.json({ reservation })
})
app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'The server encountered an error. Please try again.' })
})
app.listen(PORT, () => console.log(`Maison Ember API listening on http://localhost:${PORT}`))
