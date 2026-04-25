import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Activity, BookOpen, Flame, TrendingUp, Target, Calendar, ChevronRight, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { statsApi, progressApi } from '../services/api'
import { useApi } from '../hooks/useApi'
import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import ProgressRing from '../components/ProgressRing'
import StreakBadge from '../components/StreakBadge'
import StreakCalendar from '../components/StreakCalendar'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { format, addDays } from 'date-fns'

const TOTAL_SESSIONS_GOAL = 200
const TOTAL_QUESTIONS_GOAL = 450

export default function Dashboard() {
  //const { user } = useAuth()
  const { user, loading: authLoading } = useAuth()

  //const { data: stats, loading: statsLoading } = useApi(() => statsApi.getDashboard())
  //const { data: progressData, loading: progressLoading } = useApi(() => progressApi.getAll())

  const { data: stats, loading: statsLoading } = useApi(
  () => statsApi.getDashboard(),
  [user],
  { immediate: !!user }
)

const { data: progressData, loading: progressLoading } = useApi(
  () => progressApi.getAll(),
  [user],
  { immediate: !!user }
)

  //  SAFE DATA FIX
  const entries = Array.isArray(progressData?.entries)
    ? progressData.entries
    : Array.isArray(progressData)
    ? progressData
    : []

  //  SAFE MEMO
  const weeklyData = useMemo(() => {
    if (!Array.isArray(entries)) return []

    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    const today = new Date()

    return days.map((day, i) => {
      const date = addDays(today, i - 6)
      const dateStr = format(date, 'yyyy-MM-dd')

      const entry = entries.find(e =>
        e?.date && e.date.startsWith(dateStr)
      )


      // modifyting 
      if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Loading...
    </div>
  )
}


      return {
        day,
        Sessions: entry?.sessionsCompleted || 0,
        Questions: entry?.questionsSolved || 0,
      }
    })
  }, [entries])

  //  SAFE CALC
  const completionPct = Math.round(
    ((stats?.totalSessions || 0) / TOTAL_SESSIONS_GOAL) * 100
  )

  const loading = statsLoading || progressLoading

  //  DEBUG (remove later)
  console.log("stats:", stats)
  console.log("progressData:", progressData)
  console.log("entries:", entries)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">

      <h1 className="text-2xl font-bold mb-6">
        Hey, {user?.name || 'User'} 
      </h1>

      {loading ? (
        <LoadingSpinner text="Loading dashboard..." />
      ) : (
        <>
          {/* SIMPLE SAFE UI FIRST */}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard label="Sessions" value={stats?.totalSessions || 0} icon={Activity} />
            <StatCard label="Questions" value={stats?.totalQuestions || 0} icon={Target} />
          </div>

          <div className="mb-6">
            <ProgressBar
              label="Sessions Progress"
              value={stats?.totalSessions || 0}
              max={TOTAL_SESSIONS_GOAL}
            />
          </div>

          {/* Chart */}
          <div className="bg-slate-900 p-4 rounded-xl mb-6">
            <h2 className="mb-4">Weekly Progress</h2>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Sessions" fill="#f97316" />
                <Bar dataKey="Questions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Entries */}
          <div className="bg-slate-900 p-4 rounded-xl">
            <h2 className="mb-4">Recent Entries</h2>

            {entries.length === 0 ? (
              <p className="text-slate-400">No entries yet</p>
            ) : (
              entries.slice(0,5).map((e) => (
                <div key={e._id} className="mb-2 text-sm">
                  {e.topic || "No topic"} — {e.sessionsCompleted}s / {e.questionsSolved}q
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}