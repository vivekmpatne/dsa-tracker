import React from 'react'

export default function ProgressBar({ label, value, max, color = 'orange', showCount = true }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  const colorMap = {
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    gold: 'bg-yellow-500',
  }

  const glowMap = {
    orange: 'shadow-orange-500/50',
    green: 'shadow-green-500/50',
    blue: 'shadow-blue-500/50',
    gold: 'shadow-yellow-500/50',
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-mono text-slate-300">
          {showCount ? `${value} / ${max}` : `${pct}%`}
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${colorMap[color]} ${pct > 0 ? 'shadow-' + glowMap[color] : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right">
        <span className="text-xs text-slate-500">{pct}% complete</span>
      </div>
    </div>
  )
}
