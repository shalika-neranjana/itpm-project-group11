import { Routes, Route } from 'react-router-dom'
import EnhancedLogin from './Profiles/EnhancedLogin'
import EnhancedRegister from './Profiles/EnhancedRegister'
import Dashboard from './pages/Dashboard'
import StudentProfile from './Profiles/EnhancedStudentProfile'
import AdminDashboardComplete from './Profiles/AdminDashboardComplete'
import AdminSimple from './Profiles/AdminSimple'
import InternshipMarketplace from './Profiles/InternshipMarketplace'
import CompanyDashboard from './Profiles/CompanyDashboard'
import ApplicationForm from './Profiles/ApplicationForm'

function App() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Routes>
        <Route path="/" element={<EnhancedLogin />} />
        <Route path="/login" element={<EnhancedLogin />} />
        <Route path="/register" element={<EnhancedRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/admin" element={<AdminDashboardComplete />} />
        <Route path="/admin-simple" element={<AdminSimple />} />
        <Route path="/marketplace" element={<InternshipMarketplace />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/apply/:id" element={<ApplicationForm />} />
      </Routes>
    </div>
  )
}

export default App