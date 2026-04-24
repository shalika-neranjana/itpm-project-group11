import { useEffect, useState } from 'react'
import { interestCategories } from './constants'

const emptyInterest = { name: '', category: interestCategories[0] }
const interestCategoryTagClass = {
  Technology: 'bg-sky-50 text-sky-700',
  Design: 'bg-fuchsia-50 text-fuchsia-700',
  Analytics: 'bg-indigo-50 text-indigo-700',
  Business: 'bg-emerald-50 text-emerald-700',
  Communication: 'bg-amber-50 text-amber-700',
}

function IconButton({ onClick, label, tone = 'default', disabled = false, children }) {
  const toneClass =
    tone === 'danger'
      ? 'border-red-200 text-red-600 hover:bg-red-50 focus-visible:ring-red-200'
      : 'border-[#D4E0FA] text-[#3B6FE8] hover:bg-[#EEF2FD] focus-visible:ring-[#8DB2FF]'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${toneClass}`}
    >
      {children}
    </button>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10.4-10.4a1.4 1.4 0 0 0 0-2L16.4 5.6a1.4 1.4 0 0 0-2 0L4 16v4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5.6a1.6 1.6 0 0 1 1.6-1.6h2.8A1.6 1.6 0 0 1 15 5.6V7m-8 0 1 12a1.6 1.6 0 0 0 1.6 1.5h4.8A1.6 1.6 0 0 0 16 19L17 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InterestsSection({ interests, aspirations, onSave, saving }) {
  const [draftInterests, setDraftInterests] = useState(interests)
  const [draftAspirations, setDraftAspirations] = useState(aspirations || '')
  const [showInterestModal, setShowInterestModal] = useState(false)
  const [interestMode, setInterestMode] = useState('add')
  const [activeInterestIndex, setActiveInterestIndex] = useState(null)
  const [interestForm, setInterestForm] = useState(emptyInterest)
  const [showAspirationModal, setShowAspirationModal] = useState(false)
  const [aspirationForm, setAspirationForm] = useState('')
  const [interestSearch, setInterestSearch] = useState('')
  const [interestCategoryFilter, setInterestCategoryFilter] = useState('all')

  useEffect(() => {
    setDraftInterests(interests)
  }, [interests])

  useEffect(() => {
    setDraftAspirations(aspirations || '')
  }, [aspirations])

  const sanitizeInterests = (items) =>
    items.filter((interest) => interest.name.trim() && interest.category.trim())

  const persistInterestChanges = async (nextInterests, nextAspirations = draftAspirations) => {
    setDraftInterests(nextInterests)
    setDraftAspirations(nextAspirations)
    await onSave({
      interests: sanitizeInterests(nextInterests),
      aspirations: nextAspirations,
    })
  }

  const openAddInterestModal = () => {
    setInterestMode('add')
    setActiveInterestIndex(null)
    setInterestForm(emptyInterest)
    setShowInterestModal(true)
  }

  const openEditInterestModal = (index) => {
    setInterestMode('edit')
    setActiveInterestIndex(index)
    setInterestForm(draftInterests[index])
    setShowInterestModal(true)
  }

  const handleInterestSubmit = async (event) => {
    event.preventDefault()

    if (!interestForm.name.trim()) {
      return
    }

    const normalizedInterest = {
      name: interestForm.name.trim(),
      category: interestForm.category,
    }

    let nextInterests = [...draftInterests]
    if (interestMode === 'edit' && activeInterestIndex !== null) {
      nextInterests = nextInterests.map((interest, index) =>
        index === activeInterestIndex ? normalizedInterest : interest,
      )
    } else {
      nextInterests = [...nextInterests, normalizedInterest]
    }

    await persistInterestChanges(nextInterests)
    setShowInterestModal(false)
    setActiveInterestIndex(null)
  }

  const handleDeleteInterest = async (index) => {
    const nextInterests = draftInterests.filter((_, itemIndex) => itemIndex !== index)
    await persistInterestChanges(nextInterests)
  }

  const openAspirationModal = () => {
    setAspirationForm(draftAspirations)
    setShowAspirationModal(true)
  }

  const handleAspirationSave = async (event) => {
    event.preventDefault()
    await persistInterestChanges(draftInterests, aspirationForm.trim())
    setShowAspirationModal(false)
  }

  const handleAspirationDelete = async () => {
    await persistInterestChanges(draftInterests, '')
  }

  const filteredInterests = draftInterests.map((interest, index) => ({ ...interest, originalIndex: index })).filter((interest) => {
    const query = interestSearch.trim().toLowerCase()
    const matchesSearch =
      !query ||
      interest.name.toLowerCase().includes(query) ||
      interest.category.toLowerCase().includes(query)
    const matchesCategory =
      interestCategoryFilter === 'all' || interest.category === interestCategoryFilter

    return matchesSearch && matchesCategory
  })

  const getInterestTagClass = (category) =>
    interestCategoryTagClass[category] ?? 'bg-[#EEF2FD] text-[#3B6FE8]'

  return (
    <section className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-2 border-b border-[#E8EAF0] pb-5">
        <h2 className="font-display text-2xl font-bold text-[#1A1D27]">My Interests</h2>
        <p className="text-sm text-[#6B7280]">
          Capture the domains you enjoy so the system can align career paths with your preferences.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={interestSearch}
              onChange={(event) => setInterestSearch(event.target.value)}
              placeholder="Search interests..."
              className="rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm text-[#1A1D27] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
            />

            <select
              value={interestCategoryFilter}
              onChange={(event) => setInterestCategoryFilter(event.target.value)}
              className="rounded-[10px] border border-[#E8EAF0] bg-white px-3 py-2 text-sm text-[#1A1D27] outline-none transition hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
            >
              <option value="all">All Categories</option>
              {interestCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
          <button
            type="button"
            onClick={openAddInterestModal}
            disabled={saving}
            className="rounded-[10px] border border-[#D4E0FA] px-4 py-3 text-sm font-semibold text-[#3B6FE8] transition hover:border-[#BFD4FF] hover:bg-[#EEF2FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DB2FF] focus-visible:ring-offset-2"
          >
            Add Interest
          </button>
          </div>
        </div>

        {draftInterests.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredInterests.map((interest) => (
              <article
                key={`${interest.name}-${interest.originalIndex}`}
                className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-4 transition hover:-translate-y-0.5 hover:border-[#D4E0FA] hover:shadow-[0_6px_18px_rgba(26,29,39,0.08)]"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="text-xl font-semibold text-[#1A1D27] break-words">{interest.name}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getInterestTagClass(interest.category)}`}>
                      {interest.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconButton
                      onClick={() => openEditInterestModal(interest.originalIndex)}
                      label="Edit interest"
                      disabled={saving}
                    >
                      <PencilIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteInterest(interest.originalIndex)}
                      label="Delete interest"
                      tone="danger"
                      disabled={saving}
                    >
                      <TrashIcon />
                    </IconButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {draftInterests.length > 0 && filteredInterests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-6 text-center text-sm text-[#6B7280]">
            No interests match your search or filter.
          </div>
        ) : (
          draftInterests.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-6 text-center text-sm text-[#6B7280]">
            No interests added yet.
          </div>
          )
        )}

        <div className="rounded-2xl border border-[#E8EAF0] bg-gradient-to-br from-[#FCFCFD] to-[#F7FAFF] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-[#1A1D27]">Career Aspiration Note</p>
              <p className="mt-2 max-h-44 overflow-auto pr-2 text-sm leading-7 text-[#6B7280]">
                {draftAspirations || 'Add your aspiration note to guide smarter career recommendations.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <IconButton onClick={openAspirationModal} label="Edit career aspiration" disabled={saving}>
                <PencilIcon />
              </IconButton>
              <IconButton
                onClick={handleAspirationDelete}
                label="Delete career aspiration"
                tone="danger"
                disabled={saving || !draftAspirations}
              >
                <TrashIcon />
              </IconButton>
            </div>
          </div>
        </div>

      </div>

      {showInterestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D27]/45 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-2xl font-bold text-[#1A1D27]">
              {interestMode === 'edit' ? 'Edit Interest' : 'Add Interest'}
            </h3>
            <p className="mt-1 text-sm text-[#6B7280]">Update your interests to refine guidance quality.</p>

            <form onSubmit={handleInterestSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Interest Name</label>
                <input
                  type="text"
                  value={interestForm.name}
                  onChange={(event) =>
                    setInterestForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                  placeholder="e.g., Product Design"
                  className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Category</label>
                <select
                  value={interestForm.category}
                  onChange={(event) =>
                    setInterestForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
                >
                  {interestCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInterestModal(false)}
                  className="rounded-[10px] border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#CAD8F5] hover:bg-[#F7F8FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CAD8F5] focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[10px] bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D5CD4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DB2FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#9CB7F5]"
                >
                  {saving ? 'Saving...' : interestMode === 'edit' ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAspirationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D27]/45 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-2xl font-bold text-[#1A1D27]">Career Aspiration Note</h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              Describe the role or impact you want to pursue in the future.
            </p>

            <form onSubmit={handleAspirationSave} className="mt-5 space-y-4">
              <textarea
                rows="5"
                value={aspirationForm}
                onChange={(event) => setAspirationForm(event.target.value)}
                placeholder="I want to work on products that improve digital accessibility."
                className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAspirationModal(false)}
                  className="rounded-[10px] border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#CAD8F5] hover:bg-[#F7F8FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CAD8F5] focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[10px] bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D5CD4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DB2FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#9CB7F5]"
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default InterestsSection
