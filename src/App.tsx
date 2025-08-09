import { useEffect, useMemo, useState } from 'react'
import './index.css'
import { useAuth } from './auth'
import type { Task, Habit } from './types'
import { formatDate, getDaysInMonth, startOfWeek } from './types'
import { HabitProgressChart } from './components/HabitProgressChart'
import {
  addHabit as addHabitDoc,
  addTask as addTaskDoc,
  deleteTaskDoc,
  subscribeHabits,
  subscribeTasks,
  updateHabit,
  updateTask,
} from './services/firestore'
import { upsertTaskEvent, listEvents } from './services/googleCalendar'

function Navbar({ onToggleTheme }: { onToggleTheme: () => void }) {
  const { user, signOut } = useAuth()
  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur dark:bg-black/80 dark:border-white/10">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-black" />
          <span className="text-lg font-semibold tracking-tight">Habit Planner</span>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <a className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white" href="#tasks">Tasks</a>
          <a className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white" href="#habits">Habits</a>
          <a className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white" href="#calendar">Calendar</a>
          <button className="btn-outline text-xs" onClick={onToggleTheme}>Theme</button>
          {user ? (
            <button className="btn-outline text-xs" onClick={() => signOut()}>Sign out</button>
          ) : (
            <span className="text-xs text-gray-500">Not signed in</span>
          )}
        </nav>
      </div>
    </header>
  )
}

function AddTaskForm({ onAdd }: { onAdd: (task: Task) => void }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(formatDate(new Date()))
  const [period, setPeriod] = useState<Task['period']>('daily')
  return (
    <form
      className="flex w-full flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return
        onAdd({
          id: crypto.randomUUID(),
          title: title.trim(),
          date,
          period,
          completed: false,
        })
        setTitle('')
      }}
   >
      <input
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand focus:outline-none"
        placeholder="Add a task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none sm:w-40"
        value={period}
        onChange={(e) => setPeriod(e.target.value as Task['period'])}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <input
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none sm:w-44"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button className="inline-flex items-center justify-center rounded-md bg-brand px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600" type="submit">Add Task</button>
    </form>
  )
}

function TaskList({
  tasks,
  onToggle,
  onDelete,
  onEdit,
  title,
}: {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  title: string
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:bg-black dark:border-white/10">
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 rounded-md border border-black/10 p-2 dark:border-white/10">
              <label className="flex grow items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => onToggle(t.id)}
                />
                <span className={t.completed ? 'line-through text-gray-400' : ''}>{t.title}</span>
              </label>
              <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
                <span>{t.period}</span>
                <span>·</span>
                <span>{t.date}</span>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center justify-center rounded-md border border-black/20 bg-white px-2 py-1 text-xs shadow-sm transition-colors hover:bg-black/5" onClick={() => onEdit(t)}>Edit</button>
                <button className="inline-flex items-center justify-center rounded-md border border-black/20 bg-white px-2 py-1 text-xs shadow-sm transition-colors hover:bg-black/5" onClick={() => onDelete(t.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AddHabitForm({ onAdd }: { onAdd: (habit: Habit) => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [range, setRange] = useState<{ start: string; end: string }>(() => {
    const today = formatDate(new Date())
    const in30 = formatDate(new Date(Date.now() + 29 * 24 * 3600 * 1000))
    return { start: today, end: in30 }
  })

  return (
    <form
      className="flex w-full flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim()) return
        onAdd({
          id: crypto.randomUUID(),
          name: name.trim(),
          color,
          startDate: range.start,
          endDate: range.end,
          completions: [],
        })
        setName('')
      }}
    >
      <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand focus:outline-none" placeholder="Add a habit..." value={name} onChange={(e) => setName(e.target.value)} />
      <input className="input sm:w-32" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none sm:w-44" type="date" value={range.start} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} />
      <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none sm:w-44" type="date" value={range.end} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} />
      <button className="inline-flex items-center justify-center rounded-md bg-brand px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600" type="submit">Add Habit</button>
    </form>
  )
}

function HabitTracker({
  habits,
  toggleCompletion,
  selectedMonth,
}: {
  habits: Habit[]
  toggleCompletion: (habitId: string, day: string) => void
  selectedMonth: Date
}) {
  const days = useMemo(() => getDaysInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth()), [selectedMonth])

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:bg-black dark:border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-[1] bg-white p-2 text-left text-sm font-semibold dark:bg-black">Habit</th>
              {days.map((d) => (
                <th key={d.toISOString()} className="p-1 text-center text-[10px] text-gray-500">
                  {d.getDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((h) => {
              const streak = computeStreak(h, days)
              return (
                <tr key={h.id} className="border-t">
                  <td className="sticky left-0 z-[1] bg-white p-2 dark:bg-black">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: h.color }} />
                      <div>
                        <div className="font-medium">{h.name}</div>
                        <div className="text-xs text-black/50 dark:text-white/50">Streak: {streak} days</div>
                      </div>
                    </div>
                  </td>
                  {days.map((d) => {
                    const iso = formatDate(d)
                    const withinRange = (!h.startDate || iso >= h.startDate) && (!h.endDate || iso <= h.endDate!)
                    const done = h.completions.includes(iso)
                    return (
                      <td key={iso} className="p-1 text-center">
                        <button
                          aria-label={`Toggle ${h.name} on ${iso}`}
                          disabled={!withinRange}
                          onClick={() => toggleCompletion(h.id, iso)}
                          className={
                            'mx-auto block h-6 w-6 rounded-md border transition-colors ' +
                            (done ? 'border-transparent' : 'border-gray-300') +
                            ' ' +
                            (withinRange ? 'hover:opacity-80' : 'opacity-30 cursor-not-allowed')
                          }
                          style={{ backgroundColor: done ? h.color : undefined }}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function computeStreak(habit: Habit, days: Date[]): number {
  // compute most recent continuous streak up to latest day in provided month
  const completionSet = new Set(habit.completions)
  const sorted = [...days].sort((a, b) => b.getTime() - a.getTime())
  let streak = 0
  for (const d of sorted) {
    const iso = formatDate(d)
    const withinRange = (!habit.startDate || iso >= habit.startDate) && (!habit.endDate || iso <= habit.endDate!)
    if (!withinRange) continue
    if (completionSet.has(iso)) streak++
    else break
  }
  return streak
}

function Calendar({
  year,
  monthIndex,
  tasks,
  habits,
  onToggleHabit,
}: {
  year: number
  monthIndex: number
  tasks: Task[]
  habits: Habit[]
  onToggleHabit: (habitId: string, dateIso: string) => void
}) {
  const todayIso = formatDate(new Date())
  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const first = startOfWeek(new Date(year, monthIndex, 1))
  const weeks: Date[][] = []
  let cursor = new Date(first)
  while (cursor.getMonth() <= monthIndex || weeks.length === 0) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (cursor.getMonth() > monthIndex && cursor.getDay() === 1) break
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:bg-black dark:border-white/10">
      <div className="grid grid-cols-7 gap-2">
        {weekdayLabels.map((l) => (
          <div key={l} className="p-2 text-center text-xs font-medium text-gray-500">{l}</div>
        ))}
        {weeks.flat().map((d) => {
          const iso = formatDate(d)
          const inMonth = d.getMonth() === monthIndex
          const dayTasks = tasks.filter((t) => t.date === iso)
          const activeHabits = habits.filter((h) => {
            const within = (!h.startDate || iso >= h.startDate) && (!h.endDate || iso <= h.endDate!)
            return within && h.completions.includes(iso)
          })
          return (
            <div
              key={iso}
              className={
                'min-h-28 rounded-lg border p-2 ' +
                (inMonth ? 'bg-white dark:bg-black' : 'bg-black/[0.03] text-black/40 dark:bg-white/10 dark:text-white/50') +
                ' ' +
                (iso === todayIso ? 'ring-2 ring-brand' : '')
              }
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{d.getDate()}</span>
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="truncate rounded bg-black/5 px-2 py-1 text-xs dark:bg-white/10">{t.title}</div>
                ))}
                {activeHabits.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => onToggleHabit(h.id, iso)}
                    className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-white"
                    style={{ backgroundColor: h.color }}
                  >
                    ✓ {h.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function App() {
  const { user, loading, accessToken, signInGoogle, signInEmail, signUpEmail, signInGuest } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  // Firestore subscriptions when logged in
  useEffect(() => {
    if (!user) {
      setTasks([])
      setHabits([])
      return
    }
    const unsubTasks = subscribeTasks(user.uid, setTasks)
    const unsubHabits = subscribeHabits(user.uid, setHabits)
    return () => {
      unsubTasks()
      unsubHabits()
    }
  }, [user])

  // Task actions
  const addTask = async (t: Task) => {
    if (!user) return
    const { id, ...data } = t
    await addTaskDoc(user.uid, data)
    if (accessToken) {
      try { await upsertTaskEvent(accessToken, t) } catch {}
    }
  }
  const toggleTask = async (id: string) => {
    if (!user) return
    const current = tasks.find((t) => t.id === id)
    if (!current) return
    await updateTask(user.uid, id, { completed: !current.completed })
  }
  const deleteTask = async (id: string) => {
    if (!user) return
    await deleteTaskDoc(user.uid, id)
  }

  // Habit actions
  const addHabit = async (h: Habit) => {
    if (!user) return
    const { id, ...data } = h
    await addHabitDoc(user.uid, data)
  }
  const toggleHabitCompletion = async (habitId: string, iso: string) => {
    if (!user) return
    const curr = habits.find((h) => h.id === habitId)
    if (!curr) return
    const next = curr.completions.includes(iso)
      ? curr.completions.filter((d) => d !== iso)
      : [...curr.completions, iso].sort()
    await updateHabit(user.uid, habitId, { completions: next })
  }
  // const deleteHabit = async (id: string) => {
  //   if (!user) return
  //   await deleteHabitDoc(user.uid, id)
  // }

  // Filtering by day/week/month
  const [filterRange, setFilterRange] = useState<'day' | 'week' | 'month'>('day')
  const todayIso = formatDate(new Date())
  function isInSelectedRange(iso: string) {
    if (filterRange === 'day') return iso === todayIso
    if (filterRange === 'week') {
      const start = startOfWeek(new Date())
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      const s = formatDate(start)
      const e = formatDate(end)
      return iso >= s && iso <= e
    }
    // month view uses `selectedMonth`
    const d = new Date(iso)
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear()
  }
  const rangedTasks = tasks.filter((t) => isInSelectedRange(t.date))
  const daily = rangedTasks.filter((t) => t.period === 'daily')
  const weekly = rangedTasks.filter((t) => t.period === 'weekly')
  const monthly = rangedTasks.filter((t) => t.period === 'monthly')

  const overdue = tasks.filter((t) => !t.completed && t.date < todayIso)

  const handleToggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  function openEditTask(task: Task, updater: typeof updateTask) {
    const title = prompt('Edit task title', task.title)
    if (title == null) return
    const date = prompt('Edit date (YYYY-MM-DD)', task.date) || task.date
    const period = (prompt('Edit period (daily/weekly/monthly)', task.period) || task.period) as Task['period']
    if (!user) return
    updater(user.uid, task.id, { title: title.trim(), date, period })
  }

  // Auto-import calendar events for the selected month (idempotent per month)
  const [importKey, setImportKey] = useState<string | null>(null)
  useEffect(() => {
    if (!user || !accessToken) return
    const key = `${user.uid}:${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}`
    if (importKey === key) return
    const run = async () => {
      try {
        const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
        const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
        const events = await listEvents(accessToken, start.toISOString(), new Date(end.getTime() + 24*3600*1000 - 1).toISOString())
        for (const ev of events) {
          const iso = ev.start?.date || (ev.start?.dateTime ? ev.start.dateTime.slice(0,10) : undefined)
          if (!iso) continue
          const title: string = ev.summary || 'Event'
          const exists = tasks.some((t) => t.date === iso && t.title === title)
          if (exists) continue
          await addTask({ id: crypto.randomUUID(), title, date: iso, period: 'daily', completed: false })
        }
      } finally {
        setImportKey(key)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accessToken, selectedMonth])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onToggleTheme={handleToggleTheme} />
      <main className="mx-auto my-6 w-full max-w-6xl space-y-8 px-4 md:px-6 lg:px-8">
        {!loading && !user ? (
          <AuthGate onGoogle={() => signInGoogle()} onEmail={signInEmail} onSignUp={signUpEmail} onGuest={signInGuest} />
        ) : null}
        {user ? (
        <>
        <section id="tasks" className="space-y-4">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <div className="flex items-center justify-between gap-3">
            <AddTaskForm onAdd={addTask} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">Filter:</span>
            {(['day','week','month'] as const).map((r) => (
              <button key={r} className={`btn-outline ${filterRange===r? 'ring-1 ring-brand':''}`} onClick={() => setFilterRange(r)}>{r}</button>
            ))}
            <div className="ml-auto text-xs text-gray-500">Overdue: {overdue.length}</div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <TaskList title="Daily" tasks={daily} onToggle={toggleTask} onDelete={deleteTask} onEdit={(t)=>openEditTask(t, updateTask)} />
            <TaskList title="Weekly" tasks={weekly} onToggle={toggleTask} onDelete={deleteTask} onEdit={(t)=>openEditTask(t, updateTask)} />
            <TaskList title="Monthly" tasks={monthly} onToggle={toggleTask} onDelete={deleteTask} onEdit={(t)=>openEditTask(t, updateTask)} />
          </div>
        </section>

        <section id="habits" className="space-y-4">
          <h2 className="text-2xl font-bold">Habits</h2>
          <AddHabitForm onAdd={addHabit} />
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50"
              onClick={() =>
                setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
              }
            >
              Prev Month
            </button>
            <div className="text-sm text-gray-600">
              {selectedMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <button
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50"
              onClick={() =>
                setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
              }
            >
              Next Month
            </button>
          </div>
          <HabitTracker
            habits={habits}
            toggleCompletion={toggleHabitCompletion}
            selectedMonth={selectedMonth}
          />
          <HabitProgressChart habits={habits} monthDays={getDaysInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth()).map((d)=>formatDate(d))} />
        </section>

        <section id="calendar" className="space-y-4">
          <h2 className="text-2xl font-bold">Calendar</h2>
          <Calendar
            year={selectedMonth.getFullYear()}
            monthIndex={selectedMonth.getMonth()}
            tasks={tasks}
            habits={habits}
            onToggleHabit={toggleHabitCompletion}
          />
          <div className="flex gap-3">
            <button className="btn-outline" onClick={() => signInGoogle(true)}>Connect Google Calendar</button>
            {accessToken ? <span className="text-xs text-green-600">Calendar connected</span> : null}
          </div>
        </section>
        </>
        ) : null}
      </main>
    </div>
  )
}

export default App

function AuthGate({ onGoogle, onEmail, onSignUp, onGuest }: { onGoogle: () => void; onEmail: (email: string, pw: string) => void; onSignUp: (email: string, pw: string) => void; onGuest: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
      <h3 className="mb-3 text-lg font-semibold">Sign in to save your data</h3>
      <div className="mx-auto flex max-w-md flex-col gap-3">
        <button className="btn-primary" onClick={onGoogle}>Continue with Google</button>
        <button className="btn-outline" onClick={onGuest}>Continue as Guest</button>
        <div className="my-2 text-xs text-gray-500">or</div>
        <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none dark:bg-gray-900 dark:border-gray-700" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none dark:bg-gray-900 dark:border-gray-700" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div className="flex gap-3">
          <button className="btn-outline" onClick={()=>onEmail(email, password)}>Login</button>
          <button className="btn-outline" onClick={()=>onSignUp(email, password)}>Sign Up</button>
        </div>
      </div>
    </div>
  )
}
