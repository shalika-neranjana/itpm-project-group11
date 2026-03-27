import { useEffect, useState } from 'react'
import { interestCategories } from './constants'

const emptyInterest = { name: '', category: interestCategories[0] }

function IconButton({ onClick, label, tone = 'default', disabled = false, children }) {
  const toneClass =
    tone === 'danger'
      ? 'border-red-200 text-red-600 hover:bg-red-50'
      : 'border-[#D4E0FA] text-[#3B6FE8] hover:bg-[#EEF2FD]'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border transition disabled:cursor-not-allowed disabled:opacity-60 ${toneClass}`}
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

  return (
    <section className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-2 border-b border-[#E8EAF0] pb-5">
        <h2 className="font-display text-2xl font-bold text-[#1A1D27]">My Interests</h2>
        <p className="text-sm text-[#6B7280]">
          Capture the domains you enjoy so the system can align career paths with your preferences.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openAddInterestModal}
            disabled={saving}
            className="rounded-[10px] border border-[#D4E0FA] px-4 py-3 text-sm font-semibold text-[#3B6FE8] transition hover:bg-[#EEF2FD]"
          >
            Add Interest
          </button>
        </div>

        {draftInterests.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {draftInterests.map((interest, index) => (
              <article
                key={`${interest.name}-${index}`}
                className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1A1D27]">{interest.name}</p>
                    <span className="mt-2 inline-flex rounded-full bg-[#EEF2FD] px-3 py-1 text-xs font-semibold text-[#3B6FE8]">
                      {interest.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconButton
                      onClick={() => openEditInterestModal(index)}
                      label="Edit interest"
                      disabled={saving}
                    >
                      <PencilIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteInterest(index)}
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
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-6 text-center text-sm text-[#6B7280]">
            No interests added yet.
          </div>
        )}

        <div className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#1A1D27]">Career Aspiration Note</p>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
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

        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8092B5]">
          {saving ? 'Saving changes...' : 'Changes are synced automatically.'}
        </p>
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
                  className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Category</label>
                <select
                  value={interestForm.category}
                  onChange={(event) =>
                    setInterestForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
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
                  className="rounded-[10px] border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[10px] bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D5CD4] disabled:cursor-not-allowed disabled:bg-[#9CB7F5]"
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
                className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAspirationModal(false)}
                  className="rounded-[10px] border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[10px] bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D5CD4] disabled:cursor-not-allowed disabled:bg-[#9CB7F5]"
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
