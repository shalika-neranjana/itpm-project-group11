import { useEffect, useState } from 'react'
import { skillCategories, skillLevels } from './constants'

const emptySkill = { name: '', category: skillCategories[0], level: skillLevels[0] }

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

function SkillsSection({ skills, onSave, saving }) {
  const [draftSkills, setDraftSkills] = useState(skills)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [skillMode, setSkillMode] = useState('add')
  const [activeSkillIndex, setActiveSkillIndex] = useState(null)
  const [skillForm, setSkillForm] = useState(emptySkill)

  useEffect(() => {
    setDraftSkills(skills)
  }, [skills])

  const sanitizeSkills = (items) =>
    items.filter((skill) => skill.name.trim() && skill.category.trim() && skill.level.trim())

  const persistSkills = async (nextSkills) => {
    setDraftSkills(nextSkills)
    await onSave({ skills: sanitizeSkills(nextSkills) })
  }

  const openAddSkillModal = () => {
    setSkillMode('add')
    setActiveSkillIndex(null)
    setSkillForm(emptySkill)
    setShowSkillModal(true)
  }

  const openEditSkillModal = (index) => {
    setSkillMode('edit')
    setActiveSkillIndex(index)
    setSkillForm(draftSkills[index])
    setShowSkillModal(true)
  }

  const handleSkillSubmit = async (event) => {
    event.preventDefault()

    if (!skillForm.name.trim()) {
      return
    }

    const normalizedSkill = {
      name: skillForm.name.trim(),
      category: skillForm.category,
      level: skillForm.level,
    }

    let nextSkills = [...draftSkills]
    if (skillMode === 'edit' && activeSkillIndex !== null) {
      nextSkills = nextSkills.map((skill, index) =>
        index === activeSkillIndex ? normalizedSkill : skill,
      )
    } else {
      nextSkills = [...nextSkills, normalizedSkill]
    }

    await persistSkills(nextSkills)
    setShowSkillModal(false)
    setActiveSkillIndex(null)
  }

  const handleSkillDelete = async (index) => {
    const nextSkills = draftSkills.filter((_, itemIndex) => itemIndex !== index)
    await persistSkills(nextSkills)
  }

  return (
    <section className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-2 border-b border-[#E8EAF0] pb-5">
        <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Skills</h2>
        <p className="text-sm text-[#6B7280]">
          Keep an up-to-date view of your capabilities so career suggestions reflect your current strengths.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openAddSkillModal}
            disabled={saving}
            className="rounded-[10px] border border-[#D4E0FA] px-4 py-3 text-sm font-semibold text-[#3B6FE8] transition hover:bg-[#EEF2FD]"
          >
            Add Skill
          </button>
        </div>

        {draftSkills.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {draftSkills.map((skill, index) => (
              <article
                key={`${skill.name}-${skill.level}-${index}`}
                className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-3.5"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A1D27] break-words">{skill.name}</p>
                    <p className="mt-1 text-sm text-[#6B7280] break-words">{skill.category}</p>
                    <span className="mt-2 inline-flex rounded-full bg-[#EEF2FD] px-2.5 py-1 text-xs font-semibold text-[#3B6FE8]">
                      {skill.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconButton
                      onClick={() => openEditSkillModal(index)}
                      label="Edit skill"
                      disabled={saving}
                    >
                      <PencilIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleSkillDelete(index)}
                      label="Delete skill"
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
            No skills added yet.
          </div>
        )}

      </div>

      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D27]/45 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-2xl font-bold text-[#1A1D27]">
              {skillMode === 'edit' ? 'Edit Skill' : 'Add Skill'}
            </h3>
            <p className="mt-1 text-sm text-[#6B7280]">Keep your strongest competencies visible and current.</p>

            <form onSubmit={handleSkillSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Skill Name</label>
                <input
                  type="text"
                  value={skillForm.name}
                  onChange={(event) =>
                    setSkillForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                  placeholder="e.g., React"
                  className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Category</label>
                  <select
                    value={skillForm.category}
                    onChange={(event) =>
                      setSkillForm((current) => ({ ...current, category: event.target.value }))
                    }
                    className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
                  >
                    {skillCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">Level</label>
                  <select
                    value={skillForm.level}
                    onChange={(event) =>
                      setSkillForm((current) => ({ ...current, level: event.target.value }))
                    }
                    className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
                  >
                    {skillLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="rounded-[10px] border border-[#E8EAF0] px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[10px] bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D5CD4] disabled:cursor-not-allowed disabled:bg-[#9CB7F5]"
                >
                  {saving ? 'Saving...' : skillMode === 'edit' ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default SkillsSection
