import { useEffect, useState } from 'react'
import { interestCategories } from './constants'

const emptyInterest = { name: '', category: interestCategories[0] }

function InterestsSection({ interests, aspirations, onSave, saving }) {
  const [draftInterests, setDraftInterests] = useState(
    interests.length > 0 ? interests : [emptyInterest],
  )
  const [draftAspirations, setDraftAspirations] = useState(aspirations || '')

  useEffect(() => {
    setDraftInterests(interests.length > 0 ? interests : [emptyInterest])
  }, [interests])

  useEffect(() => {
    setDraftAspirations(aspirations || '')
  }, [aspirations])

  const handleInterestChange = (index, field, value) => {
    setDraftInterests((current) =>
      current.map((interest, itemIndex) =>
        itemIndex === index ? { ...interest, [field]: value } : interest,
      ),
    )
  }

  const addInterest = () => {
    setDraftInterests((current) => [...current, emptyInterest])
  }

  const removeInterest = (index) => {
    setDraftInterests((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({
      interests: draftInterests.filter((interest) => interest.name.trim() && interest.category.trim()),
      aspirations: draftAspirations,
    })
  }

  return (
    <section className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-2 border-b border-[#E8EAF0] pb-5">
        <h2 className="font-display text-2xl font-bold text-[#1A1D27]">My Interests</h2>
        <p className="text-sm text-[#6B7280]">
          Capture the domains you enjoy so the system can align career paths with your preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {draftInterests.map((interest, index) => (
          <div key={`${interest.name}-${index}`} className="grid gap-3 rounded-2xl bg-[#F7F8FA] p-4 md:grid-cols-[1.4fr_1fr_auto]">
            <input
              type="text"
              value={interest.name}
              onChange={(event) => handleInterestChange(index, 'name', event.target.value)}
              placeholder="Interest name"
              className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
            />

            <select
              value={interest.category}
              onChange={(event) => handleInterestChange(index, 'category', event.target.value)}
              className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
            >
              {interestCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => removeInterest(index)}
              className="rounded-[10px] border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}

        <div>
          <button
            type="button"
            onClick={addInterest}
            className="rounded-[10px] border border-[#D4E0FA] px-4 py-3 text-sm font-semibold text-[#3B6FE8] transition hover:bg-[#EEF2FD]"
          >
            Add Interest
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Career Aspirations</label>
          <textarea
            rows="4"
            value={draftAspirations}
            onChange={(event) => setDraftAspirations(event.target.value)}
            placeholder="Describe the kind of work you want to grow into."
            className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-[10px] bg-[#3B6FE8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2D5CD4] disabled:cursor-not-allowed disabled:bg-[#9CB7F5]"
        >
          {saving ? 'Saving...' : 'Save Interests'}
        </button>
      </form>
    </section>
  )
}

export default InterestsSection
