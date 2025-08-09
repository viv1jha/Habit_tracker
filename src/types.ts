export type Task = {
  id: string
  title: string
  date: string // ISO date (YYYY-MM-DD)
  period: 'daily' | 'weekly' | 'monthly'
  completed: boolean
}

export type Habit = {
  id: string
  name: string
  color: string
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  completions: string[] // ISO dates
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Monday-start
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getDaysInMonth(year: number, monthIndex: number): Date[] {
  const date = new Date(year, monthIndex, 1)
  const days: Date[] = []
  while (date.getMonth() === monthIndex) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}
