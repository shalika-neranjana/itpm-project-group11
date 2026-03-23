import { useEffect, useState, useMemo } from 'react'
import { getTasks, addTask, updateTask, deleteTask } from '../../api/myInternships'

const PRIORITIES = ['High', 'Medium', 'Low']
const EMPTY = { taskName: '', priority: 'Medium', dueDate: '' }

const priorityStyle = {
  High:   'bg-[#FEE2E2] text-[#DC2626]',
  Medium: 'bg-[#FEF3C7] text-[#D97706]',
  Low:    'bg-[#EEF2FD] text-[#3B6FE8]',
}

export default function MyTasks({ internshipId }) {
  const [tasks,    setTasks]    = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(EMPTY)
  const [editId,   setEditId]   = useState(null)
  const [loading,  setLoading]  = useState(true)

  // ── Filter state ──
  const [filterPriority, setFilterPriority] = useState('all')   
  const [filterStatus,   setFilterStatus]   = useState('all')    
  const [showFilter,     setShowFilter]     = useState(false)

  useEffect(() => {
    getTasks(internshipId)
      .then(res => setTasks(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [internshipId])

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true) }

  const openEdit = (task) => {
    setForm({
      taskName: task.taskName,
      priority: task.priority,
      dueDate:  task.dueDate.split('T')[0],
    })
    setEditId(task._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, internship: internshipId }
    if (editId) {
      const res = await updateTask(editId, payload)
      setTasks(prev => prev.map(t => t._id === editId ? res.data : t))
    } else {
      const res = await addTask(payload)
      setTasks(prev => [...prev, res.data])
    }
    setShowForm(false)
  }

  const toggleComplete = async (task) => {
    const res = await updateTask(task._id, { completed: !task.completed })
    setTasks(prev => prev.map(t => t._id === task._id ? res.data : t))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  const clearFilters = () => {
    setFilterPriority('all')
    setFilterStatus('all')
  }

  const hasActiveFilters = filterPriority !== 'all' || filterStatus !== 'all'

  // ── Filtered tasks ──
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority)
    }

    if (filterStatus === 'completed') {
      result = result.filter(t => t.completed)
    } else if (filterStatus === 'pending') {
      result = result.filter(t => !t.completed)
    }

    return result
  }, [tasks, filterPriority, filterStatus])

  // ── Task summary counts ──
  const completedCount = tasks.filter(t => t.completed).length
  const pendingCount   = tasks.filter(t => !t.completed).length
  const highCount      = tasks.filter(t => t.priority === 'High' && !t.completed).length

  const inputCls = "w-full rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3B6FE8] transition-colors"
  const labelCls = "mb-1 block text-xs font-semibold text-[#1A1D27]"

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3B6FE8] border-t-transparent" />
      Loading...
    </div>
  )

  return (
    <div>

      {/* ── Header ── */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-[#1A1D27]">My Tasks</h3>
        <button
          onClick={openAdd}
          className="rounded-xl bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2D5CD4] transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* ── Stats row ── */}
      {tasks.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5">
            <p className="text-xs text-[#6B7280]">Total</p>
            <p className="text-lg font-bold text-[#1A1D27]">{tasks.length}</p>
          </div>
          <div className="rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5">
            <p className="text-xs text-[#6B7280]">Completed</p>
            <p className="text-lg font-bold text-[#16A34A]">{completedCount}</p>
          </div>
          <div className="rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5">
            <p className="text-xs text-[#6B7280]">Pending</p>
            <p className="text-lg font-bold text-[#D97706]">{pendingCount}</p>
          </div>
          {highCount > 0 && (
            <div className="rounded-xl border border-[#FEE2E2] bg-[#FEE2E2] px-4 py-2.5">
              <p className="text-xs text-[#DC2626]">High Priority Pending</p>
              <p className="text-lg font-bold text-[#DC2626]">{highCount}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Filter bar ── */}
      {tasks.length > 0 && (
        <div className="mb-5 space-y-3">

          {/* Filter toggle button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilter(prev => !prev)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                showFilter || hasActiveFilters
                  ? 'border-[#3B6FE8] bg-[#EEF2FD] text-[#3B6FE8]'
                  : 'border-[#E8EAF0] bg-white text-[#6B7280] hover:bg-[#F7F8FA]'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-[#3B6FE8]" />
              )}
            </button>

            {/* Results count */}
            {hasActiveFilters && (
              <p className="text-xs text-[#6B7280]">
                Showing{' '}
                <span className="font-semibold text-[#1A1D27]">{filteredTasks.length}</span>
                {' '}of{' '}
                <span className="font-semibold text-[#1A1D27]">{tasks.length}</span>
                {' '}tasks
              </p>
            )}
          </div>

          {/* Filter panel */}
          {showFilter && (
            <div className="rounded-2xl border border-[#E8EAF0] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Priority filter */}
                <div>
                  <label className={labelCls}>Priority</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all',    label: 'All',    style: 'border-[#E8EAF0] text-[#6B7280]' },
                      { value: 'High',   label: 'High',   style: 'border-[#DC2626] text-[#DC2626]'  },
                      { value: 'Medium', label: 'Medium', style: 'border-[#D97706] text-[#D97706]'  },
                      { value: 'Low',    label: 'Low',    style: 'border-[#3B6FE8] text-[#3B6FE8]'  },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilterPriority(opt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          filterPriority === opt.value
                            ? opt.value === 'all'
                              ? 'border-[#3B6FE8] bg-[#3B6FE8] text-white'
                              : opt.value === 'High'
                              ? 'border-[#DC2626] bg-[#DC2626] text-white'
                              : opt.value === 'Medium'
                              ? 'border-[#D97706] bg-[#D97706] text-white'
                              : 'border-[#3B6FE8] bg-[#3B6FE8] text-white'
                            : `bg-white hover:bg-[#F7F8FA] ${opt.style}`
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status filter */}
                <div>
                  <label className={labelCls}>Status</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all',       label: 'All Tasks'  },
                      { value: 'pending',   label: 'Pending'    },
                      { value: 'completed', label: 'Completed'  },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilterStatus(opt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          filterStatus === opt.value
                            ? 'border-[#3B6FE8] bg-[#3B6FE8] text-white'
                            : 'border-[#E8EAF0] bg-white text-[#6B7280] hover:bg-[#F7F8FA]'
                        }`}
                      >
                        {opt.value === 'completed' && '✅ '}
                        {opt.value === 'pending'   && '⏳ '}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <div className="mt-3 border-t border-[#E8EAF0] pt-3">
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-[#DC2626] hover:underline"
                  >
                    ✕ Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <div className="mb-5 rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <h4 className="mb-4 font-semibold text-[#1A1D27]">
            {editId ? 'Edit Task' : 'New Task'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className={labelCls}>Task Name</label>
                <input
                  name="taskName"
                  value={form.taskName}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  placeholder="e.g. Build login page"
                />
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className={inputCls}
                >
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Due Date</label>
                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-[#3B6FE8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2D5CD4] transition-colors"
              >
                {editId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#E8EAF0] px-5 py-2 text-sm font-semibold text-[#6B7280] hover:bg-[#F7F8FA] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Empty state ── */}
      {tasks.length === 0 && !showForm && (
        <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-8 text-center text-sm text-[#6B7280]">
          No tasks yet.
        </div>
      )}

      {/* ── No results from filter ── */}
      {tasks.length > 0 && filteredTasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-8 text-center">
          <p className="text-sm font-semibold text-[#1A1D27]">No tasks found</p>
          <p className="mt-1 text-xs text-[#6B7280]">Try adjusting your filters</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs font-semibold text-[#3B6FE8] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Task rows ── */}
      <div className="flex flex-col gap-2.5">
        {filteredTasks.map(task => {
          const isOverdue = !task.completed && new Date(task.dueDate) < new Date()
          return (
            <div
              key={task._id}
              className={`flex items-center gap-3 rounded-2xl border bg-white px-5 py-3.5 transition-all hover:border-[#D4E0FA] ${
                isOverdue ? 'border-[#FEE2E2]' : 'border-[#E8EAF0]'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(task)}
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  task.completed
                    ? 'border-[#16A34A] bg-[#16A34A]'
                    : 'border-[#E8EAF0] hover:border-[#3B6FE8]'
                }`}
              >
                {task.completed && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>

              {/* Task name */}
              <span className={`flex-1 text-sm font-semibold ${
                task.completed ? 'text-[#6B7280] line-through' : 'text-[#1A1D27]'
              }`}>
                {task.taskName}
              </span>

              {/* Overdue badge */}
              {isOverdue && (
                <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-xs font-semibold text-[#DC2626]">
                  Overdue
                </span>
              )}

              {/* Priority badge */}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityStyle[task.priority]}`}>
                {task.priority}
              </span>

              {/* Due date */}
              <span className={`text-xs ${isOverdue ? 'font-semibold text-[#DC2626]' : 'text-[#6B7280]'}`}>
                {new Date(task.dueDate).toLocaleDateString('en-MY')}
              </span>

              {/* Actions */}
              <button
                onClick={() => openEdit(task)}
                className="rounded-lg border border-[#E8EAF0] px-2 py-1 text-xs hover:bg-[#F7F8FA] transition-colors"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(task._id)}
                className="rounded-lg border border-[#E8EAF0] px-2 py-1 text-xs hover:bg-[#FEE2E2] transition-colors"
              >
                🗑️
              </button>
            </div>
          )
        })}
      </div>

    </div>
  )
}