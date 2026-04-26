import React, { useState, useMemo } from 'react'
import { progressApi } from '../services/api'
import { useApi, useAsyncAction } from '../hooks/useApi'
import { Search, Filter, Edit3, Trash2, X, Check, ChevronDown, History as HistoryIcon, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'

const DAY_TYPE_STYLES = {
  normal: 'bg-slate-700/60 text-slate-300',
  exam: 'bg-red-500/10 text-red-400 border border-red-500/20',
  holiday: 'bg-green-500/10 text-green-400 border border-green-500/20',
}

function EditModal({ entry, onSave, onClose }) {
  const [form, setForm] = useState({
    dayType: entry.dayType || 'normal',
    sessionsCompleted: String(entry.sessionsCompleted || ''),
    questionsSolved: String(entry.questionsSolved || ''),
    topic: entry.topic || '',
    notes: entry.notes || '',
    revision: entry.revision || false,
  })
  const { loading, run } = useAsyncAction()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    await run(async () => {
      await progressApi.update(entry._id, {
        ...form,
        sessionsCompleted: Number(form.sessionsCompleted),
        questionsSolved: Number(form.questionsSolved),
      })
      toast.success('Entry updated!')
      onSave()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="font-display font-bold text-white">Edit Entry</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-xs text-slate-500 font-mono">{format(parseISO(entry.date), 'EEE, MMM d yyyy')}</div>

          <div className="grid grid-cols-3 gap-2">
            {['normal', 'exam', 'holiday'].map(type => (
              <button key={type} type="button" onClick={() => set('dayType', type)}
                className={`py-2 rounded-lg text-sm font-medium capitalize border-2 transition-all ${form.dayType === type ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Sessions</label>
              <input type="number" min="0" max="10" className="input" value={form.sessionsCompleted}
                onChange={e => set('sessionsCompleted', e.target.value)} />
            </div>
            <div>
              <label className="label">Questions</label>
              <input type="number" min="0" max="30" className="input" value={form.questionsSolved}
                onChange={e => set('questionsSolved', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Topic</label>
            <input type="text" className="input" value={form.topic}
              onChange={e => set('topic', e.target.value)} />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes}
              onChange={e => set('notes', e.target.value)} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div onClick={() => set('revision', !form.revision)}
              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${form.revision ? 'bg-orange-500 border-orange-500' : 'border-slate-600'}`}>
              {form.revision && <Check size={11} className="text-white" />}
            </div>
            <span className="text-sm text-slate-300 flex items-center gap-1.5"><Brain size={14} className="text-slate-400" />Revision session</span>
          </label>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
            Save Changes
          </button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function History() {

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [editEntry, setEditEntry] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  //const { data, loading, refetch } = useApi(() => progressApi.getAll())
  const {
  data,
  loading,
  error,
  execute: fetchHistory
  } = useApi(progressApi.getAll);



  const { run: runDelete } = useAsyncAction()

  useEffect(() => {
  fetchHistory();
  }, []);
  
  // const entries = useMemo(() => {
  //   const raw = data?.entries || data || []
  //   return [...raw].sort((a, b) => new Date(b.date) - new Date(a.date))
  // }, [data])

  const entries = useMemo(() => {
  const raw = data?.data || [];
  return [...raw].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data]);


  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchSearch = !search || (e.topic || '').toLowerCase().includes(search.toLowerCase())
      const matchFrom = !dateFrom || e.date >= dateFrom
      const matchTo = !dateTo || e.date <= dateTo
      return matchSearch && matchFrom && matchTo
    })
  }, [entries, search, dateFrom, dateTo])

  const handleDelete = async (id) => {
    await runDelete(async () => {
      await progressApi.delete(id)
      toast.success('Entry deleted')
      setDeleteId(null)
      fetchHistory()
    })
  }

  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo('') }
  const hasFilters = search || dateFrom || dateTo

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {editEntry && (
        <EditModal
          entry={editEntry}
          onSave={() => { setEditEntry(null); fetchHistory(); }}
          onClose={() => setEditEntry(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">History</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} entries found</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${showFilters || hasFilters ? 'border-orange-500/40 bg-orange-500/10 text-orange-400' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
        >
          <Filter size={15} />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-orange-500" />}
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="card animate-slide-up">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">From Date</label>
                <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="label">To Date</label>
                <input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-3 text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Entries List */}
      {loading ? (
        <LoadingSpinner text="Loading history..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title={hasFilters ? 'No matching entries' : 'No entries yet'}
          description={hasFilters ? 'Try adjusting your filters.' : 'Start logging sessions to see your history.'}
          action={hasFilters ? <button onClick={clearFilters} className="btn-secondary text-sm">Clear Filters</button> : null}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => (
            <div key={entry._id} className="card-hover group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display font-semibold text-white text-sm">
                      {entry.topic || <span className="text-slate-500 italic">No topic</span>}
                    </span>
                    <span className={`badge text-[11px] ${DAY_TYPE_STYLES[entry.dayType] || DAY_TYPE_STYLES.normal}`}>
                      {entry.dayType || 'normal'}
                    </span>
                    {entry.revision && (
                      <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px]">
                        <Brain size={10} /> revision
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 mb-2">
                    {entry.date ? format(parseISO(entry.date), 'EEEE, MMMM d, yyyy') : ''}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-mono font-bold text-orange-400">{entry.sessionsCompleted}</span>
                      <span className="text-slate-500 text-xs">sessions</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-mono font-bold text-blue-400">{entry.questionsSolved}</span>
                      <span className="text-slate-500 text-xs">questions</span>
                    </div>
                  </div>

                  {entry.notes && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 bg-slate-800/50 rounded-lg px-2.5 py-1.5">
                      {entry.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => setEditEntry(entry)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit3 size={15} />
                  </button>
                  {deleteId === entry._id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(entry._id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-xs font-medium">
                        Confirm
                      </button>
                      <button onClick={() => setDeleteId(null)}
                        className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-all">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(entry._id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
