import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Sparkles, Loader2, GripVertical, ChevronRight, ChevronDown } from 'lucide-react'
import { createJourney, updateJourney, generateJourneySteps } from '../../api/student_guidance/guidanceApi'
import { toast as swalToast } from '../../utils/swal'

function JourneyFormModal({ journey, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps: []
  })
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)

  useEffect(() => {
    if (journey) {
      setFormData({
        title: journey.title || '',
        description: journey.description || '',
        steps: journey.steps || []
      })
    }
  }, [journey])

  const handleAddStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { title: '', timeAllocation: '', subSteps: [] }
      ]
    }))
  }

  const handleRemoveStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }))
  }

  const handleStepChange = (index, field, value) => {
    setFormData((prev) => {
      const newSteps = [...prev.steps]
      newSteps[index] = { ...newSteps[index], [field]: value }
      return { ...prev, steps: newSteps }
    })
  }

  const handleAddSubStep = (stepIndex) => {
    setFormData((prev) => {
      const newSteps = [...prev.steps]
      const step = newSteps[stepIndex]
      step.subSteps = [...(step.subSteps || []), { title: '', timeAllocation: '' }]
      return { ...prev, steps: newSteps }
    })
  }

  const handleRemoveSubStep = (stepIndex, subIndex) => {
    setFormData((prev) => {
      const newSteps = [...prev.steps]
      const step = newSteps[stepIndex]
      step.subSteps = step.subSteps.filter((_, i) => i !== subIndex)
      return { ...prev, steps: newSteps }
    })
  }

  const handleSubStepChange = (stepIndex, subIndex, field, value) => {
    setFormData((prev) => {
      const newSteps = [...prev.steps]
      const step = newSteps[stepIndex]
      const newSubSteps = [...step.subSteps]
      newSubSteps[subIndex] = { ...newSubSteps[subIndex], [field]: value }
      step.subSteps = newSubSteps
      return { ...prev, steps: newSteps }
    })
  }

  const handleGenerateAI = async () => {
    if (!formData.title) {
        swalToast('Please enter a title first', 'warning')
        return
    }

    try {
      setAiGenerating(true)
      const steps = await generateJourneySteps({
        title: formData.title,
        description: formData.description
      })
      setFormData((prev) => ({ ...prev, steps }))
      swalToast('Roadmap generated with AI!', 'success')
    } catch (error) {
      console.error('AI Generation error:', error)
      swalToast('Failed to generate steps with AI', 'error')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title) {
        swalToast('Title is required', 'error')
        return
    }

    try {
      setLoading(true)
      if (journey) {
        await updateJourney(journey._id, formData)
        swalToast('Journey updated successfully')
      } else {
        await createJourney(formData)
        swalToast('Journey created successfully')
      }
      onSuccess()
    } catch (error) {
      console.error('Form submission error:', error)
      swalToast('Failed to save journey', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-xl font-bold text-[#1A1D27]">
            {journey ? 'Edit Journey' : 'Create New Journey'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1A1D27] mb-1.5">Journey Title</label>
                <input
                  type="text"
                  placeholder="e.g., Become a Senior Frontend Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1D27] mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Describe your goals and motivation..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 resize-none"
                />
              </div>
            </div>

            {/* AI Generator Button */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border border-blue-100">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-900">AI Roadmap Generator</p>
                            <p className="text-xs text-blue-700/80">Generate a structured plan based on your title.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={aiGenerating || !formData.title}
                        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 transition disabled:opacity-50"
                    >
                        {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        Generate
                    </button>
                </div>
            </div>

            {/* Steps Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#1A1D27]">Steps & Milestones</h4>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Step
                </button>
              </div>

              {formData.steps.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-sm text-gray-400">No steps added yet. Add one manually or use AI.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.steps.map((step, sIdx) => (
                    <div key={sIdx} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Step Title"
                          value={step.title}
                          onChange={(e) => handleStepChange(sIdx, 'title', e.target.value)}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Time (e.g. 2w)"
                          value={step.timeAllocation}
                          onChange={(e) => handleStepChange(sIdx, 'timeAllocation', e.target.value)}
                          className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                        <input
                          type="date"
                          value={step.deadline ? new Date(step.deadline).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleStepChange(sIdx, 'deadline', e.target.value)}
                          className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(sIdx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Sub-steps */}
                      <div className="ml-4 space-y-2">
                        {step.subSteps?.map((sub, ssIdx) => (
                          <div key={ssIdx} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-300" />
                            <input
                              type="text"
                              placeholder="Sub-step Title"
                              value={sub.title}
                              onChange={(e) => handleSubStepChange(sIdx, ssIdx, 'title', e.target.value)}
                              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500"
                            />
                             <input
                              type="text"
                              placeholder="Time"
                              value={sub.timeAllocation}
                              onChange={(e) => handleSubStepChange(sIdx, ssIdx, 'timeAllocation', e.target.value)}
                              className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[10px] outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSubStep(sIdx, ssIdx)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddSubStep(sIdx)}
                          className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-blue-600 ml-4"
                        >
                          <Plus className="h-3 w-3" />
                          Add Sub-step
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#3B6FE8] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2D5CD4] disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {journey ? 'Save Changes' : 'Create Journey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JourneyFormModal
