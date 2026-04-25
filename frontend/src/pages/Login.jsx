import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Code2, Eye, EyeOff, Flame } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 🔥')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30">
            <Code2 size={24} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-2">Keep your streak alive 🔥</p>
        </div>

        <div className="card border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                : <><Flame size={16} />Sign In</>
              }
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            No account?{' '}
            <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Sign up free
            </Link>
          </div>
        </div>

        {/* Stats teaser */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[['Track', 'Daily Sessions'], ['Build', 'Streaks'], ['Crush', 'DSA Goals']].map(([verb, noun]) => (
            <div key={verb} className="text-center py-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="font-display text-sm font-bold text-orange-400">{verb}</div>
              <div className="text-xs text-slate-500 mt-0.5">{noun}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



