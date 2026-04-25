import React from 'react'
import { Flame, TrendingUp } from 'lucide-react'

const getStreakTier = (days) => {
  if (days >= 15) return { label: 'Legendary', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', ring: 'ring-yellow-500/20' }
  if (days >= 8) return { label: 'On Fire', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', ring: 'ring-green-500/20' }
  if (days >= 4) return { label: 'Hot Streak', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', ring: 'ring-blue-500/20' }
  if (days >= 1) return { label: 'Warming Up', color: 'text-slate-400', bg: 'bg-slate-700/50 border-slate-600/30', ring: 'ring-slate-600/20' }
  return { label: 'Start Today', color: 'text-slate-500', bg: 'bg-slate-800 border-slate-700', ring: 'ring-slate-700/20' }
}

export default function StreakBadge({ currentStreak = 0, longestStreak = 0, compact = false }) {
  const tier = getStreakTier(currentStreak)

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${tier.bg} ${tier.color}`}>
        <span className="fire-icon">🔥</span>
        <span className="font-mono">{currentStreak}d</span>
      </div>
    )
  }

  return (
    <div className={`card border rounded-2xl p-5 ${tier.bg} ring-1 ${tier.ring}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Current Streak</div>
          <div className={`font-display text-5xl font-bold ${tier.color} flex items-end gap-2`}>
            <span>{currentStreak}</span>
            <span className="text-2xl pb-0.5">days</span>
          </div>
          <div className={`mt-2 text-sm font-semibold ${tier.color}`}>
            <span className="fire-icon mr-1">🔥</span>
            {tier.label}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 mb-1">Best Streak</div>
          <div className="font-mono text-xl font-bold text-slate-300">{longestStreak}d</div>
          <TrendingUp size={14} className="text-slate-500 ml-auto mt-1" />
        </div>
      </div>

      {currentStreak === 0 && (
        <div className="mt-4 text-xs text-slate-500 bg-slate-800/50 rounded-lg px-3 py-2">
          Log today's progress to start your streak!
        </div>
      )}

      {currentStreak > 0 && (
        <div className="mt-4 grid grid-cols-5 gap-1">
          {Array.from({ length: 5 }, (_, i) => i + 1).map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i <= Math.min(currentStreak, 5) ? (tier.color.includes('yellow') ? 'bg-yellow-500' : tier.color.includes('green') ? 'bg-green-500' : tier.color.includes('blue') ? 'bg-blue-500' : 'bg-slate-500') : 'bg-slate-800'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
