import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, BookOpen, History, LogOut, Menu, X, Flame, Code2 } from 'lucide-react'
import toast from 'react-hot-toast'

const NavItem = ({ to, icon: Icon, label, mobile, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-2.5 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 font-body
       ${isActive
         ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
         : 'text-slate-400 hover:text-white hover:bg-slate-800'
       }
       ${mobile ? 'w-full text-base py-3' : ''}`
    }
  >
    <Icon size={mobile ? 20 : 16} />
    {label}
  </NavLink>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/daily-log', icon: BookOpen, label: 'Daily Log' },
    { to: '/history', icon: History, label: 'History' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Code2 size={16} className="text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-base leading-none tracking-tight">DSA Tracker</div>
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">Master the Grind</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>

          {/* User + Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-200">{user?.name || 'User'}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-sm"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-2 animate-fade-in">
          {navItems.map(item => (
            <NavItem key={item.to} {...item} mobile onClick={() => setMenuOpen(false)} />
          ))}
          <div className="pt-2 border-t border-slate-800 mt-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <div>
                <div className="text-sm font-medium text-slate-200">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
