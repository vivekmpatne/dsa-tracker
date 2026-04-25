import React, { useState, useEffect } from 'react'
import { progressApi } from '../services/api'
import { useApi, useAsyncAction } from '../hooks/useApi'
import { BookOpen, CheckCircle2, AlertCircle, RotateCcw, Target, Clock, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import LoadingSpinner from '../components/LoadingSpinner'

const DAY_TYPES = [
  {
    id: 'normal',
    label: 'Normal Day',
    icon: '📚',
    color: 'border-slate-600 text-slate-300',
    activeColor: 'border-orange-500 bg-orange-500/10 text-orange-300',
    targets: { sessions: '2', questions: '2' },
    desc: '2 sessions · 2–3 questions',
  },
  {
    id: 'exam',
    label: 'Exam Day',
    icon: '📝',
    color: 'border-slate-600 text-slate-300',
    activeColor: 'border-red-500 bg-red-500/10 text-red-300',
    targets: { sessions: '1', questions: '1' },
    desc: '1 session · 1 question',
  },
  {
    id: 'holiday',
    label: 'Holiday',
    icon: '🌴',
    color: 'border-slate-600 text-slate-300',
    activeColor: 'border-green-500 bg-green-500/10 text-green-300',
    targets: { sessions: '3', questions: '4' },
    desc: '3–4 sessions · 4–5 questions',
  },
]

const defaultForm = {
  dayType: 'normal',
  sessionsCompleted: '',
  questionsSolved: '',
  topic: '',
  notes: '',
  revision: false,
}

export default function DailyLog() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState(defaultForm)
  const [existingEntry, setExistingEntry] = useState(null)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { data: progressData, loading: checkingToday, refetch } = useApi(
    () => progressApi.getAll({ date: today }),
    [],
    {
      onSuccess: (data) => {
        const entries = data?.entries || data || []
        const todayEntry = entries.find(e => e.date?.startsWith(today))
        if (todayEntry) {
          setExistingEntry(todayEntry)
          setForm({
            dayType: todayEntry.dayType || 'normal',
            sessionsCompleted: String(todayEntry.sessionsCompleted || ''),
            questionsSolved: String(todayEntry.questionsSolved || ''),
            topic: todayEntry.topic || '',
            notes: todayEntry.notes || '',
            revision: todayEntry.revision || false,
          })
          setIsUpdateMode(false)
        }
      }
    }
  )

  const { loading: submitting, run } = useAsyncAction()

  const selectedType = DAY_TYPES.find(d => d.id === form.dayType)

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.sessionsCompleted || !form.questionsSolved) {
      toast.error('Sessions and questions are required')
      return
    }

    const payload = {
      date: today,
      dayType: form.dayType,
      sessionsCompleted: Number(form.sessionsCompleted),
      questionsSolved: Number(form.questionsSolved),
      topic: form.topic,
      notes: form.notes,
      revision: form.revision,
    }

    await run(async () => {
      if (existingEntry && isUpdateMode) {
        await progressApi.update(existingEntry._id, payload)
        toast.success('Entry updated! 💪')
      } else {
        await progressApi.create(payload)
        toast.success('Session logged! Keep grinding 🔥')
      }
      setSubmitted(true)
      refetch()
    })
  }

  const handleReset = () => {
    setForm(defaultForm)
    setExistingEntry(null)
    setIsUpdateMode(false)
    setSubmitted(false)
  }

  const sessionsNum = Number(form.sessionsCompleted) || 0
  const questionsNum = Number(form.questionsSolved) || 0
  const targetSessions = Number(selectedType?.targets.sessions) || 2
  const targetQuestions = Number(selectedType?.targets.questions) || 2
  const sessionsDone = sessionsNum >= targetSessions
  const questionsDone = questionsNum >= targetQuestions

  if (checkingToday) return <LoadingSpinner size="lg" text="Checking today's entry..." />

  // Already submitted or entry exists (not in update mode)
  if ((submitted || existingEntry) && !isUpdateMode) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Today's Done!</h2>
          <p className="text-slate-400 text-sm mb-6">
            {existingEntry
              ? `You logged ${existingEntry.sessionsCompleted} sessions and ${existingEntry.questionsSolved} questions${existingEntry.topic ? ` on ${existingEntry.topic}` : ''}.`
              : "Great work! Your session has been saved."}
          </p>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex flex-col items-center bg-slate-800 rounded-xl px-6 py-4 border border-slate-700">
              <span className="font-mono text-3xl font-bold text-orange-400">{existingEntry?.sessionsCompleted ?? sessionsNum}</span>
              <span className="text-xs text-slate-500 mt-0.5">Sessions</span>
            </div>
            <div className="flex flex-col items-center bg-slate-800 rounded-xl px-6 py-4 border border-slate-700">
              <span className="font-mono text-3xl font-bold text-blue-400">{existingEntry?.questionsSolved ?? questionsNum}</span>
              <span className="text-xs text-slate-500 mt-0.5">Questions</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            {existingEntry && (
              <button onClick={() => setIsUpdateMode(true)} className="btn-secondary flex items-center gap-2">
                <RotateCcw size={15} />
                Update Entry
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-white">Daily Log</h1>
        <p className="text-slate-400 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        {existingEntry && isUpdateMode && (
          <div className="mt-3 flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
            <AlertCircle size={15} />
            Updating existing entry for today
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Day Type */}
        <div className="card space-y-3">
          <label className="section-title text-base">Day Type</label>
          <div className="grid grid-cols-3 gap-3">
            {DAY_TYPES.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => set('dayType', type.id)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${form.dayType === type.id ? type.activeColor : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'}`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="font-semibold text-sm">{type.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Target Banner */}
        <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3">
          <Target size={16} className="text-orange-400 flex-shrink-0" />
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-white">Today's target: </span>
            {selectedType?.desc}
          </div>
        </div>

        {/* Sessions & Questions */}
        <div className="card space-y-4">
          <label className="section-title text-base">Progress</label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Sessions Completed</label>
              <input
                type="number"
                min="0"
                max="10"
                className="input"
                placeholder="0"
                value={form.sessionsCompleted}
                onChange={e => set('sessionsCompleted', e.target.value)}
              />
              <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${sessionsDone ? 'text-green-400' : 'text-slate-500'}`}>
                <CheckCircle2 size={11} />
                Target: {targetSessions} sessions
              </div>
            </div>
            <div>
              <label className="label">Questions Solved</label>
              <input
                type="number"
                min="0"
                max="30"
                className="input"
                placeholder="0"
                value={form.questionsSolved}
                onChange={e => set('questionsSolved', e.target.value)}
              />
              <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${questionsDone ? 'text-green-400' : 'text-slate-500'}`}>
                <CheckCircle2 size={11} />
                Target: {targetQuestions} questions
              </div>
            </div>
          </div>

          {/* Live Completion Indicator */}
          {(sessionsNum > 0 || questionsNum > 0) && (
            <div className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg ${sessionsDone && questionsDone ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
              {sessionsDone && questionsDone ? (
                <><CheckCircle2 size={15} /> Target met! Great job! 🎉</>
              ) : (
                <><Clock size={15} /> Almost there — keep going!</>
              )}
            </div>
          )}
        </div>

        {/* Topic & Notes */}
        <div className="card space-y-4">
          <label className="section-title text-base">Details</label>

          <div>
            <label className="label">Topic Covered</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Binary Trees, Dynamic Programming..."
              value={form.topic}
              onChange={e => set('topic', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Key takeaways, tricky problems, patterns noticed..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('revision', !form.revision)}
              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${form.revision ? 'bg-orange-500 border-orange-500' : 'border-slate-600 hover:border-slate-500'}`}
            >
              {form.revision && <CheckCircle2 size={12} className="text-white" />}
            </button>
            <label
              onClick={() => set('revision', !form.revision)}
              className="text-sm text-slate-300 cursor-pointer select-none flex items-center gap-2"
            >
              <Brain size={15} className="text-slate-400" />
              Included revision / spaced repetition today
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
            ) : (
              <><BookOpen size={16} />{isUpdateMode ? 'Update Entry' : 'Log Session'}</>
            )}
          </button>
          {isUpdateMode && (
            <button type="button" onClick={() => setIsUpdateMode(false)} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
