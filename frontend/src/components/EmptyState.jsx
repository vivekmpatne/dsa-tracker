import React from 'react'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
          <Icon size={28} className="text-slate-500" />
        </div>
      )}
      <h3 className="font-display text-lg font-bold text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs mb-5">{description}</p>}
      {action && action}
    </div>
  )
}
