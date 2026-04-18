import { useEffect, useState, useMemo } from 'react'
import Swal from 'sweetalert2'
import { getEntries, addEntry, updateEntry, deleteEntry } from '../../api/myInternships'

const EMPTY = {
  date: '', title: '', description: '',
  startTime: '', endTime: '',
}

export default function DailyDiary({ internshipId }) {
  const [entries,   setEntries]   = useState([])
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY)
  const [editId,    setEditId]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [timeError, setTimeError] = useState('')

  const [search,      setSearch]      = useState('')
  const [filterHours, setFilterHours] = useState('all')
  const [sortBy,      setSortBy]      = useState('newest')
  const [showFilter,  setShowFilter]  = useState(false)

  useEffect(() => {
    getEntries(internshipId)
      .then(res => setEntries(res.data))
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Load',
          text: 'Could not load diary entries. Please refresh.',
          confirmButtonColor: '#3B6FE8',
        })
      })
      .finally(() => setLoading(false))
  }, [internshipId])

  const calcHours = (start, end) => {
    if (!start || !end) return 0
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60)
  }

  const handleChange = (e) => {
    setTimeError('')
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const openAdd = () => {
    setForm(EMPTY)
    setEditId(null)
    setTimeError('')
    setShowForm(true)
  }

  const openEdit = (entry) => {
    setForm({
      date:        entry.date.split('T')[0],
      title:       entry.title,
      description: entry.description,
      startTime:   entry.startTime,
      endTime:     entry.endTime,
    })
    setEditId(entry._id)
    setTimeError('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTimeError('')

    const [sh, sm] = form.startTime.split(':').map(Number)
    const [eh, em] = form.endTime.split(':').map(Number)
    const startMins = sh * 60 + sm
    const endMins   = eh * 60 + em

    if (endMins <= startMins) {
      setTimeError('End time must be later than start time.')
      return
    }

    const payload = {
      ...form,
      internship:   internshipId,
      workingHours: calcHours(form.startTime, form.endTime),
    }

    try {
      if (editId) {
        const res = await updateEntry(editId, payload)
        setEntries(prev => prev.map(e => e._id === editId ? res.data : e))
        await Swal.fire({
          icon: 'success',
          title: 'Entry Updated!',
          text: `"${form.title}" has been updated successfully.`,
          confirmButtonColor: '#3B6FE8',
          timer: 2000,
          timerProgressBar: true,
        })
      } else {
        const res = await addEntry(payload)
        setEntries(prev => [res.data, ...prev])
        await Swal.fire({
          icon: 'success',
          title: 'Entry Added!',
          text: `"${form.title}" has been saved to your diary.`,
          confirmButtonColor: '#3B6FE8',
          timer: 2000,
          timerProgressBar: true,
        })
      }
      setShowForm(false)
      setTimeError('')
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.response?.data?.message || 'Something went wrong. Please try again.',
        confirmButtonColor: '#3B6FE8',
      })
    }
  }

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Entry?',
      text: `"${title}" will be permanently deleted.`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#3B6FE8',
    })

    if (!result.isConfirmed) return

    try {
      await deleteEntry(id)
      setEntries(prev => prev.filter(e => e._id !== id))
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The diary entry has been removed.',
        confirmButtonColor: '#3B6FE8',
        timer: 1800,
        timerProgressBar: true,
      })
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err.response?.data?.message || 'Could not delete the entry. Please try again.',
        confirmButtonColor: '#3B6FE8',
      })
    }
  }

  // Confirm before closing form if data is filled
  const handleCancelForm = async () => {
    const hasData = Object.values(form).some(v => v !== '')
    if (hasData) {
      const result = await Swal.fire({
        icon: 'question',
        title: 'Discard Changes?',
        text: 'Your unsaved entry will be lost.',
        showCancelButton: true,
        confirmButtonText: 'Yes, discard',
        cancelButtonText: 'Keep editing',
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#3B6FE8',
      })
      if (result.isConfirmed) {
        setShowForm(false)
        setTimeError('')
      }
    } else {
      setShowForm(false)
      setTimeError('')
    }
  }

  const clearFilters = () => { setSearch(''); setFilterHours('all'); setSortBy('newest') }
  const hasActiveFilters = search || filterHours !== 'all' || sortBy !== 'newest'

  const filteredEntries = useMemo(() => {
    let result = [...entries]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      )
    }
    if (filterHours === 'under4') {
      result = result.filter(e => (e.workingHours ?? 0) < 4)
    } else if (filterHours === '4to8') {
      result = result.filter(e => (e.workingHours ?? 0) >= 4 && (e.workingHours ?? 0) <= 8)
    } else if (filterHours === 'over8') {
      result = result.filter(e => (e.workingHours ?? 0) > 8)
    }
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date))
    } else if (sortBy === 'hours') {
      result.sort((a, b) => (b.workingHours ?? 0) - (a.workingHours ?? 0))
    }
    return result
  }, [entries, search, filterHours, sortBy])

  const totalHours = useMemo(() =>
    entries.reduce((sum, e) => sum + (e.workingHours ?? 0), 0), [entries]
  )

  const inputCls    = "w-full rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3B6FE8] transition-colors"
  const inputErrCls = "w-full rounded-xl border border-[#DC2626] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#DC2626] transition-colors"
  const labelCls    = "mb-1 block text-xs font-semibold text-[#1A1D27]"

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3B6FE8] border-t-transparent" />
      Loading...
    </div>
  )

  return (
    <div>

      {/*  Header  */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-[#1A1D27]">Daily Diary</h3>
        <button
          onClick={openAdd}
          className="rounded-xl bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2D5CD4] transition-colors"
        >
          + Add Entry
        </button>
      </div>

      {/*  Stats row  */}
      {entries.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5">
            <p className="text-xs text-[#6B7280]">Total Entries</p>
            <p className="text-lg font-bold text-[#1A1D27]">{entries.length}</p>
          </div>
          <div className="rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5">
            <p className="text-xs text-[#6B7280]">Total Hours</p>
            <p className="text-lg font-bold text-[#3B6FE8]">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="rounded-xl border border-[#E8EAF0] bg-white px-4 py-2.5">
            <p className="text-xs text-[#6B7280]">Avg Hours/Day</p>
            <p className="text-lg font-bold text-[#7C3AED]">
              {(totalHours / entries.length).toFixed(1)}h
            </p>
          </div>
        </div>
      )}

      {/*  Search & Filter bar  */}
      {entries.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#E8EAF0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A1D27] outline-none focus:border-[#3B6FE8] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1D27]">
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilter(prev => !prev)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                showFilter || hasActiveFilters
                  ? 'border-[#3B6FE8] bg-[#EEF2FD] text-[#3B6FE8]'
                  : 'border-[#E8EAF0] bg-white text-[#6B7280] hover:bg-[#F7F8FA]'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filters
              {hasActiveFilters && <span className="flex h-2 w-2 rounded-full bg-[#3B6FE8]" />}
            </button>
          </div>

          {showFilter && (
            <div className="rounded-2xl border border-[#E8EAF0] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelCls}>Working Hours</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all',    label: 'All'     },
                      { value: 'under4', label: '< 4h'    },
                      { value: '4to8',   label: '4h – 8h' },
                      { value: 'over8',  label: '> 8h'    },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => setFilterHours(opt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          filterHours === opt.value
                            ? 'border-[#3B6FE8] bg-[#3B6FE8] text-white'
                            : 'border-[#E8EAF0] text-[#6B7280] hover:bg-[#F7F8FA]'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Sort By</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'newest', label: 'Newest First' },
                      { value: 'oldest', label: 'Oldest First' },
                      { value: 'hours',  label: 'Most Hours'   },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => setSortBy(opt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          sortBy === opt.value
                            ? 'border-[#3B6FE8] bg-[#3B6FE8] text-white'
                            : 'border-[#E8EAF0] text-[#6B7280] hover:bg-[#F7F8FA]'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="mt-3 border-t border-[#E8EAF0] pt-3">
                  <button onClick={clearFilters}
                    className="text-xs font-semibold text-[#DC2626] hover:underline">
                    ✕ Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {(search || filterHours !== 'all') && (
            <p className="text-xs text-[#6B7280]">
              Showing <span className="font-semibold text-[#1A1D27]">{filteredEntries.length}</span>
              {' '}of <span className="font-semibold text-[#1A1D27]">{entries.length}</span> entries
            </p>
          )}
        </div>
      )}

      {/*  Add / Edit Form  */}
      {showForm && (
        <div className="mb-5 rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <h4 className="mb-4 font-semibold text-[#1A1D27]">
            {editId ? 'Edit Entry' : 'New Entry'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelCls}>Date</label>
                <input name="date" type="date" value={form.date}
                  onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Title</label>
                <input name="title" value={form.title}
                  onChange={handleChange} required className={inputCls}
                  placeholder="What did you work on?" />
              </div>
              <div>
                <label className={labelCls}>Start Time</label>
                <input name="startTime" type="time" value={form.startTime}
                  onChange={handleChange} required
                  className={timeError ? inputErrCls : inputCls} />
              </div>
              <div>
                <label className={labelCls}>End Time</label>
                <input name="endTime" type="time" value={form.endTime}
                  onChange={handleChange} required
                  className={timeError ? inputErrCls : inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea name="description" value={form.description}
                  onChange={handleChange} required rows={3} className={inputCls}
                  placeholder="Describe your activities today..." />
              </div>
            </div>

            {timeError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#DC2626] bg-[#FEE2E2] px-4 py-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs font-semibold text-[#DC2626]">{timeError}</p>
              </div>
            )}

            {form.startTime && form.endTime && !timeError && (
              <p className="mt-2 text-xs text-[#6B7280]">
                Working hours:{' '}
                <span className="font-semibold text-[#3B6FE8]">
                  {calcHours(form.startTime, form.endTime).toFixed(1)}h
                </span>
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button type="submit"
                className="rounded-xl bg-[#3B6FE8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2D5CD4] transition-colors">
                {editId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={handleCancelForm}
                className="rounded-xl border border-[#E8EAF0] px-5 py-2 text-sm font-semibold text-[#6B7280] hover:bg-[#F7F8FA] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {entries.length === 0 && !showForm && (
        <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-8 text-center text-sm text-[#6B7280]">
          No diary entries yet.
        </div>
      )}

      {entries.length > 0 && filteredEntries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-8 text-center">
          <p className="text-sm font-semibold text-[#1A1D27]">No entries found</p>
          <p className="mt-1 text-xs text-[#6B7280]">Try adjusting your search or filters</p>
          <button onClick={clearFilters}
            className="mt-3 text-xs font-semibold text-[#3B6FE8] hover:underline">
            Clear filters
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filteredEntries.map(entry => (
          <div key={entry._id}
            className="rounded-2xl border border-[#E8EAF0] bg-white p-5 hover:border-[#D4E0FA] hover:shadow-[0_4px_16px_rgba(59,111,232,0.07)] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#EEF2FD] px-3 py-0.5 text-xs font-semibold text-[#3B6FE8]">
                    {new Date(entry.date).toLocaleDateString('en-MY', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                  <span className="rounded-full bg-[#EDE9FE] px-3 py-0.5 text-xs font-semibold text-[#7C3AED]">
                    {entry.workingHours?.toFixed(1)}h
                  </span>
                  <span className="font-semibold text-[#1A1D27]">{entry.title}</span>
                </div>
                <p className="text-sm leading-relaxed text-[#6B7280]">{entry.description}</p>
                <p className="mt-1 text-xs text-[#6B7280]">
                  {entry.startTime} – {entry.endTime}
                </p>
              </div>
              <div className="ml-3 flex gap-2">
                <button onClick={() => openEdit(entry)}
                  className="rounded-lg border border-[#E8EAF0] px-2.5 py-1.5 text-xs hover:bg-[#F7F8FA] transition-colors">
                  ✏️
                </button>
                <button onClick={() => handleDelete(entry._id, entry.title)}
                  className="rounded-lg border border-[#E8EAF0] px-2.5 py-1.5 text-xs hover:bg-[#FEE2E2] transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}