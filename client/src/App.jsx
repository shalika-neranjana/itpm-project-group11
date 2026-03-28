import { Routes, Route } from 'react-router-dom'
import EnhancedLogin from './Profiles/EnhancedLogin'
import EnhancedRegister from './Profiles/EnhancedRegister'
import Dashboard from './pages/Dashboard'
import AdminDashboardComplete from './Profiles/AdminDashboardComplete'
import AdminSimple from './Profiles/AdminSimple'
import InternshipMarketplace from './Profiles/InternshipMarketplace'
import CompanyDashboard from './Profiles/CompanyDashboard'
import CompanyPostInternship from './Profiles/CompanyPostInternship'
import CompanyEditInternship from './Profiles/CompanyEditInternship'
import ApplicationForm from './Profiles/ApplicationForm'
import Home from './pages/Home'
import WriteReview from './pages/WriteReview'
import ReviewDetail from './pages/ReviewDetail'


function App() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<EnhancedLogin />} />
        <Route path="/register" element={<EnhancedRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboardComplete />} />
        <Route path="/admin-simple" element={<AdminSimple />} />
        <Route path="/marketplace" element={<InternshipMarketplace />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/company-dashboard/post-internship" element={<CompanyPostInternship />} />
        <Route path="/company-dashboard/edit-internship/:id" element={<CompanyEditInternship />} />
        <Route path="/apply/:id" element={<ApplicationForm />} />
        <Route path="/write-review" element={<WriteReview />} />
        <Route path="/review/:reviewId" element={<ReviewDetail />} />
      </Routes>
    </div>
  )
}

export default App
