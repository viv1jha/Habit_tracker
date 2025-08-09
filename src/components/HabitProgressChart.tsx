import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import type { Habit } from '../types'
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export function HabitProgressChart({ habits, monthDays }: { habits: Habit[]; monthDays: string[] }) {
  const labels = monthDays
  const dataValues = useMemo(() => {
    return labels.map((iso) => habits.reduce((acc, h) => acc + (h.completions.includes(iso) ? 1 : 0), 0))
  }, [labels, habits])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <h3 className="mb-3 text-lg font-semibold">Habit Completions</h3>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'Completions',
              data: dataValues,
              backgroundColor: 'rgba(99, 102, 241, 0.6)',
            },
          ],
        }}
        options={{
          responsive: true,
          scales: { x: { ticks: { maxRotation: 0, autoSkip: true } }, y: { beginAtZero: true, ticks: { precision: 0 } } },
          plugins: { legend: { display: false } },
        }}
      />
    </div>
  )
}
