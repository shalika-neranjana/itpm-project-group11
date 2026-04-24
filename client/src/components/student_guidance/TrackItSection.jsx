import { useState, useEffect } from 'react'
import { Plus, Sparkles, Trash2, Edit2, ChevronRight, ChevronDown, CheckCircle2, Circle, Trophy, Target, TrendingUp, AlertCircle } from 'lucide-react'
import { fetchJourneys, deleteJourney, toggleJourneyStep } from '../../api/student_guidance/guidanceApi'
import JourneyFormModal from './JourneyFormModal'
import { confirm as swalConfirm, toast as swalToast } from '../../utils/swal'

function TrackItSection() {
  const [journeys, setJourneys] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJourney, setEditingJourney] = useState(null)
  const [expandedJourneys, setExpandedJourneys] = useState({})

  const loadJourneys = async () => {
    try {
      setLoading(true)
      const data = await fetchJourneys()
      setJourneys(data)
    } catch (error) {
      console.error('Failed to load journeys:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJourneys()
  }, [])

  const handleToggleExpand = (id) => {
    setExpandedJourneys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleDelete = async (id) => {
    const ok = await swalConfirm('Are you sure you want to delete this journey? All progress will be lost.')
    if (ok) {
      try {
        await deleteJourney(id)
        setJourneys((prev) => prev.filter((j) => j._id !== id))
        swalToast('Journey deleted successfully')
      } catch (error) {
        console.error('Failed to delete journey:', error)
      }
    }
  }

  const handleEdit = (journey) => {
    setEditingJourney(journey)
    setIsModalOpen(true)
  }

  const handleToggleStep = async (journeyId, stepId, subStepId, completed) => {
    try {
      const updatedJourney = await toggleJourneyStep({
        journeyId,
        stepId,
        subStepId,
        completed: !completed,
      })
      setJourneys((prev) =>
        prev.map((j) => (j._id === journeyId ? updatedJourney : j))
      )
    } catch (error) {
      console.error('Failed to toggle step:', error)
    }
  }

  const getStatusColor = (progress) => {
    if (progress === 100) return 'text-green-600 bg-green-50 border-green-100'
    if (progress > 0) return 'text-blue-600 bg-blue-50 border-blue-100'
    return 'text-gray-500 bg-gray-50 border-gray-100'
  }

  const getEngagementLevel = (progress) => {
    if (progress === 100) return { label: 'Completed', color: 'bg-green-500' }
    if (progress > 75) return { label: 'Highly Active', color: 'bg-blue-500' }
    if (progress > 30) return { label: 'On Track', color: 'bg-yellow-500' }
    if (progress > 0) return { label: 'Starting Out', color: 'bg-indigo-400' }
    return { label: 'Inactive', color: 'bg-gray-400' }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading your journeys...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1D27]">Track It</h2>
          <p className="text-sm text-[#6B7280]">Manage your personal journeys and monitor your progress.</p>
        </div>
        <button
          onClick={() => {
            setEditingJourney(null)
            setIsModalOpen(true)
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#3B6FE8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2D5CD4] shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add New Journey
        </button>
      </div>

      {/* Analytics Overview */}
      {journeys.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-[#6B7280]">Total Journeys</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1A1D27]">{journeys.length}</p>
          </div>
          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2 text-green-600">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-[#6B7280]">Completed</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1A1D27]">
              {journeys.filter((j) => j.progress === 100).length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-[#6B7280]">Avg. Progress</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1A1D27]">
              {Math.round(journeys.reduce((acc, curr) => acc + curr.progress, 0) / journeys.length)}%
            </p>
          </div>
          <div className="rounded-2xl border border-[#E8EAF0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-[#6B7280]">Overdue Steps</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1A1D27]">
              {journeys.reduce((acc, j) => acc + j.steps.filter(s => !s.completed && s.deadline && new Date(s.deadline) < new Date()).length, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Journeys List */}
      {journeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E8EAF0] bg-white py-20 px-6 text-center">
          <div className="mb-4 rounded-full bg-blue-50 p-4 text-blue-500">
            <Target className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold text-[#1A1D27]">No Journeys Yet</h3>
          <p className="mt-2 max-w-sm text-[#6B7280]">
            Start tracking your goals today. Create a journey manually or use our AI assistant to generate a roadmap for you.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#3B6FE8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2D5CD4]"
          >
            <Plus className="h-4 w-4" />
            Create Your First Journey
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {journeys.map((journey) => {
            const isExpanded = expandedJourneys[journey._id]
            const engagement = getEngagementLevel(journey.progress)

            return (
              <div
                key={journey._id}
                className="overflow-hidden rounded-2xl border border-[#E8EAF0] bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Journey Header */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[#1A1D27]">{journey.title}</h3>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(journey.progress)}`}>
                          {journey.progress}% Complete
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280] line-clamp-2">{journey.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(journey)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition"
                        title="Edit Journey"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(journey._id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-red-600 transition"
                        title="Delete Journey"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleExpand(journey._id)}
                        className="ml-2 rounded-lg bg-gray-50 p-2 text-gray-600 hover:bg-gray-100 transition"
                      >
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                      <span className="text-[#6B7280]">Progress</span>
                      <span className="text-[#3B6FE8]">{journey.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                        style={{ width: `${journey.progress}%` }}
                      />
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${engagement.color}`} />
                            <span className="text-xs font-medium text-[#4B5563]">{engagement.label}</span>
                        </div>
                        {journey.progress < 100 && (
                            <div className="flex items-center gap-1.5 text-orange-600">
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">Next step: {journey.steps.find(s => !s.completed)?.title || 'Finish up'}</span>
                            </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Journey Steps (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-[#F3F4F6] bg-[#F9FAFB] p-5 sm:p-6">
                    <div className="space-y-4">
                      {journey.steps.map((step) => (
                        <div key={step._id} className="space-y-2">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleStep(journey._id, step._id, null, step.completed)}
                              className={`mt-0.5 transition ${step.completed ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'}`}
                            >
                              {step.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm font-bold ${step.completed ? 'text-gray-400 line-through' : 'text-[#1A1D27]'}`}>
                                  {step.title}
                                </h4>
                                {step.timeAllocation && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] bg-gray-200/50 px-1.5 py-0.5 rounded">
                                    {step.timeAllocation}
                                  </span>
                                )}
                                {!step.completed && step.deadline && new Date(step.deadline) < new Date() && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                    Overdue
                                  </span>
                                )}
                              </div>
                              
                              {/* Sub Steps */}
                              {step.subSteps && step.subSteps.length > 0 && (
                                <div className="mt-3 ml-1 space-y-2 border-l-2 border-gray-200 pl-4">
                                  {step.subSteps.map((sub) => (
                                    <div key={sub._id} className="flex items-center gap-3">
                                      <button
                                        onClick={() => handleToggleStep(journey._id, step._id, sub._id, sub.completed)}
                                        className={`transition ${sub.completed ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'}`}
                                      >
                                        {sub.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                      </button>
                                      <span className={`text-xs ${sub.completed ? 'text-gray-400 line-through' : 'text-[#4B5563]'}`}>
                                        {sub.title}
                                      </span>
                                      {sub.timeAllocation && (
                                        <span className="text-[9px] text-[#9CA3AF]">({sub.timeAllocation})</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <JourneyFormModal
          journey={editingJourney}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            loadJourneys()
          }}
        />
      )}
    </div>
  )
}

export default TrackItSection
