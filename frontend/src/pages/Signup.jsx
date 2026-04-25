import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Code2, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match")
      return
    }

    setLoading(true)
    try {
      await signup(form.name, form.email, form.password)
      toast.success("Account created! Let's grind 🔥")
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (() => {
    const pw = form.password
    if (!pw) return null
    if (pw.length < 6) return { label: 'Too short', color: 'bg-red-500', w: '25%' }
    if (pw.length < 8) return { label: 'Weak', color: 'bg-orange-500', w: '50%' }
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Fair', color: 'bg-yellow-500', w: '75%' }
    return { label: 'Strong', color: 'bg-green-500', w: '100%' }
  })()

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30">
            <Code2 size={24} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Start your journey</h1>
          <p className="text-slate-400 text-sm mt-2">Build consistency, crack interviews</p>
        </div>

        <div className="card border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                autoComplete="name"
                className="input"
                placeholder="Alex Kumar"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>

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
                  autoComplete="new-password"
                  className="input pr-11"
                  placeholder="Min. 6 characters"
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
              {passwordStrength && (
                <div className="mt-1.5">
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: passwordStrength.w }} />
                  </div>
                  <span className="text-xs text-slate-500 mt-0.5">{passwordStrength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                autoComplete="new-password"
                className={`input ${form.confirm && form.confirm !== form.password ? 'border-red-500/50 focus:border-red-500' : ''}`}
                placeholder="Repeat password"
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
                : <><UserPlus size={16} />Create Account</>
              }
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
