import React from 'react'

export default function StatCard({ label, value, icon: Icon, sub, accent = 'orange', loading }) {
  const accentMap = {
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    gold: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }

  const iconClass = accentMap[accent] || accentMap.orange

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-4 w-24 rounded mb-3" />
        <div className="skeleton h-8 w-16 rounded mb-1" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    )
  }

  return (
    <div className="card-hover group animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-slate-400 font-medium">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconClass}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <div className="font-display text-3xl font-bold text-white mb-0.5 leading-none">{value ?? '—'}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}
