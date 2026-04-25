import React from 'react'

export default function ProgressRing({ value = 0, max = 100, size = 120, strokeWidth = 10, color = '#f97316', label, sublabel }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-white">{Math.round(pct)}%</span>
          {sublabel && <span className="text-xs text-slate-500 mt-0.5">{sublabel}</span>}
        </div>
      </div>
      {label && <span className="text-sm text-slate-400 font-medium">{label}</span>}
    </div>
  )
}
