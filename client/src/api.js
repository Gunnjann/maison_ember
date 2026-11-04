const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

export const getMenu = () => request('/menu')
export const getAvailability = (date, guests) =>
  request(`/availability?date=${encodeURIComponent(date)}&guests=${encodeURIComponent(guests)}`)
export const createReservation = (payload) =>
  request('/reservations', { method: 'POST', body: JSON.stringify(payload) })
