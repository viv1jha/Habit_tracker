import type { Task } from '../types'

const API_BASE = 'https://www.googleapis.com/calendar/v3'

export async function listEvents(accessToken: string, timeMin: string, timeMax: string) {
  const url = `${API_BASE}/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) throw new Error('Failed to fetch events')
  const json = await res.json()
  return json.items as any[]
}

export async function upsertTaskEvent(accessToken: string, task: Task) {
  const start = new Date(task.date + 'T09:00:00Z')
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  const body = {
    summary: task.title,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
  }
  const res = await fetch(`${API_BASE}/calendars/primary/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create event')
  return await res.json()
}
