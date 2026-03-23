import { useEffect, useState } from 'react'
import { skillCategories, skillLevels } from './constants'

const emptySkill = { name: '', category: skillCategories[0], level: skillLevels[0] }

function SkillsSection({ skills, onSave, saving }) {
  const [draftSkills, setDraftSkills] = useState(skills.length > 0 ? skills : [emptySkill])

  useEffect(() => {
    setDraftSkills(skills.length > 0 ? skills : [emptySkill])
  }, [skills])

  const handleSkillChange = (index, field, value) => {
    setDraftSkills((current) =>
      current.map((skill, itemIndex) =>
        itemIndex === index ? { ...skill, [field]: value } : skill,
      ),
    )
  }

  const addSkill = () => {
    setDraftSkills((current) => [...current, emptySkill])
  }

  const removeSkill = (index) => {
    setDraftSkills((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({
      skills: draftSkills.filter(
        (skill) => skill.name.trim() && skill.category.trim() && skill.level.trim(),
      ),
    })
  }

  return (
    <section className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-2 border-b border-[#E8EAF0] pb-5">
        <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Skills</h2>
        <p className="text-sm text-[#6B7280]">
          Keep an up-to-date view of your capabilities so career suggestions reflect your current strengths.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {draftSkills.map((skill, index) => (
          <div
            key={`${skill.name}-${index}`}
            className="grid gap-3 rounded-2xl bg-[#F7F8FA] p-4 md:grid-cols-[1.3fr_1fr_1fr_auto]"
          >
            <input
              type="text"
              value={skill.name}
              onChange={(event) => handleSkillChange(index, 'name', event.target.value)}
              placeholder="Skill name"
              className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
            />

            <select
              value={skill.category}
              onChange={(event) => handleSkillChange(index, 'category', event.target.value)}
              className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
            >
              {skillCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={skill.level}
              onChange={(event) => handleSkillChange(index, 'level', event.target.value)}
              className="w-full rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8]"
            >
              {skillLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="rounded-[10px] border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}

        <div>
          <button
            type="button"
            onClick={addSkill}
            className="rounded-[10px] border border-[#D4E0FA] px-4 py-3 text-sm font-semibold text-[#3B6FE8] transition hover:bg-[#EEF2FD]"
          >
            Add Skill
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {skills.map((skill) => (
            <div key={`${skill.name}-${skill.level}`} className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-4">
              <p className="text-sm font-semibold text-[#1A1D27]">{skill.name}</p>
              <p className="mt-1 text-sm text-[#6B7280]">{skill.category}</p>
              <span className="mt-3 inline-flex rounded-full bg-[#EEF2FD] px-3 py-1 text-xs font-semibold text-[#3B6FE8]">
                {skill.level}
              </span>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-[10px] bg-[#3B6FE8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2D5CD4] disabled:cursor-not-allowed disabled:bg-[#9CB7F5]"
        >
          {saving ? 'Saving...' : 'Save Skills'}
        </button>
      </form>
    </section>
  )
}

export default SkillsSection
