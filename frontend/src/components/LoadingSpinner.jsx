import React from 'react'

export default function LoadingSpinner({ size = 'md', text }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizeMap[size]} border-2 border-slate-700 border-t-orange-500 rounded-full animate-spin`} />
      {text && <div className="text-sm text-slate-500">{text}</div>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-slate-700 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <div className="text-slate-500 text-sm font-medium">Loading...</div>
      </div>
    </div>
  )
}
