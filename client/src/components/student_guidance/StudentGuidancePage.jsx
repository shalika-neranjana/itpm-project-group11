import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  fetchStudentGuidance,
  updateStudentInterests,
  updateStudentSkills,
} from '../../api/student_guidance/guidanceApi'
import AskInternConnectSection from './AskInternConnectSection'
import CareerSuggestionsSection from './CareerSuggestionsSection'
import ExamResultsSection from './ExamResultsSection'
import GuidanceSidebar from './GuidanceSidebar'
import InterestsSection from './InterestsSection'
import SkillsSection from './SkillsSection'

function StudentGuidancePage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('examResults')
  const [guidance, setGuidance] = useState({
    examResults: [],
    interests: [],
    skills: [],
    aspirations: '',
    careerSuggestions: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState({ interests: false, skills: false })

  const student = useMemo(() => {
    try {
      const currentStudent = JSON.parse(localStorage.getItem('student') || '{}')
      return {
        name: `${currentStudent.firstName || ''} ${currentStudent.lastName || ''}`.trim() || 'Student',
        studentId: currentStudent.studentId || '',
        email: currentStudent.email || '',
      }
    } catch {
      return { name: 'Student', studentId: '', email: '' }
    }
  }, [])

  useEffect(() => {
    const requestedTab = location.state?.guidanceTab
    const allowedTabs = ['examResults', 'interests', 'skills', 'askInternConnect', 'careers']

    if (requestedTab && allowedTabs.includes(requestedTab)) {
      setActiveTab(requestedTab)
    }
  }, [location.state])

  useEffect(() => {
    const loadGuidance = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchStudentGuidance()
        setGuidance(data)
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load student guidance data.')
      } finally {
        setLoading(false)
      }
    }

    loadGuidance()
  }, [])

  const handleInterestSave = async (payload) => {
    try {
      setError('')
      setSaveState((current) => ({ ...current, interests: true }))
      const updatedGuidance = await updateStudentInterests(payload)
      setGuidance(updatedGuidance)
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to save interests.')
    } finally {
      setSaveState((current) => ({ ...current, interests: false }))
    }
  }

  const handleSkillSave = async (payload) => {
    try {
      setError('')
      setSaveState((current) => ({ ...current, skills: true }))
      const updatedGuidance = await updateStudentSkills(payload)
      setGuidance(updatedGuidance)
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to save skills.')
    } finally {
      setSaveState((current) => ({ ...current, skills: false }))
    }
  }

  const content = {
    examResults: <ExamResultsSection student={student} examResults={guidance.examResults} />,
    interests: (
      <InterestsSection
        interests={guidance.interests}
        aspirations={guidance.aspirations}
        onSave={handleInterestSave}
        saving={saveState.interests}
      />
    ),
    skills: (
      <SkillsSection
        skills={guidance.skills}
        onSave={handleSkillSave}
        saving={saveState.skills}
      />
    ),
    askInternConnect: (
      <AskInternConnectSection
        student={student}
        interests={guidance.interests}
        skills={guidance.skills}
        examResults={guidance.examResults}
      />
    ),
    careers: (
      <CareerSuggestionsSection
        aspirations={guidance.aspirations}
        interests={guidance.interests}
        skills={guidance.skills}
        careerSuggestions={guidance.careerSuggestions}
      />
    ),
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="rounded-2xl border border-dashed border-[#D4E0FA] bg-[#F7F8FA] p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Loading Student Guidance</h2>
          <p className="mt-3 text-base text-[#6B7280]">Fetching your personalized guidance data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <GuidanceSidebar activeTab={activeTab} onChange={setActiveTab} />
        <div>{content[activeTab]}</div>
      </div>
    </div>
  )
}

export default StudentGuidancePage
