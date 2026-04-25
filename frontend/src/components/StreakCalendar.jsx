import React, { useMemo } from 'react'
import { format, subDays, eachDayOfInterval, startOfWeek, isSameDay } from 'date-fns'

const getIntensity = (count) => {
  if (!count || count === 0) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

const intensityMap = {
  0: 'bg-slate-800 border-slate-700/50',
  1: 'bg-orange-900/60 border-orange-800/40',
  2: 'bg-orange-700/60 border-orange-600/40',
  3: 'bg-orange-500/70 border-orange-400/40',
  4: 'bg-orange-400 border-orange-300/40 shadow-sm shadow-orange-500/30',
}

export default function StreakCalendar({ entries = [] }) {
  const today = new Date()
  const start = subDays(today, 83) // 12 weeks back

  const days = useMemo(() => {
    const allDays = eachDayOfInterval({ start, end: today })
    return allDays.map(day => {
      const entry = entries.find(e => isSameDay(new Date(e.date), day))
      const sessions = entry?.sessionsCompleted || 0
      return { date: day, sessions, intensity: getIntensity(sessions) }
    })
  }, [entries, today])

  // Group into weeks
  const weeks = useMemo(() => {
    const result = []
    let week = []
    days.forEach((day, i) => {
      week.push(day)
      if (week.length === 7 || i === days.length - 1) {
        result.push(week)
        week = []
      }
    })
    return result
  }, [days])

  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = -1
    weeks.forEach((week, wi) => {
      const month = week[0]?.date.getMonth()
      if (month !== lastMonth) {
        labels.push({ index: wi, label: format(week[0].date, 'MMM') })
        lastMonth = month
      }
    })
    return labels
  }, [weeks])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-base">Activity Calendar</h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Less</span>
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`w-3 h-3 rounded-sm border ${intensityMap[i]}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="relative min-w-max">
          {/* Month labels */}
          <div className="flex mb-1.5 pl-0" style={{ gap: '2px' }}>
            {weeks.map((_, wi) => {
              const label = monthLabels.find(m => m.index === wi)
              return (
                <div key={wi} style={{ width: '12px', minWidth: '12px' }}>
                  {label && <span className="text-[10px] text-slate-500 whitespace-nowrap">{label.label}</span>}
                </div>
              )
            })}
          </div>

          {/* Grid */}
          <div className="flex" style={{ gap: '2px' }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: '2px' }}>
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${format(day.date, 'MMM d')} — ${day.sessions} session${day.sessions !== 1 ? 's' : ''}`}
                    className={`w-3 h-3 rounded-sm border cursor-default transition-all hover:scale-125 ${intensityMap[day.intensity]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        {entries.length} active days in the last 12 weeks
      </div>
    </div>
  )
}
