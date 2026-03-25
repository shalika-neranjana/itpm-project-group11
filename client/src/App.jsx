import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import WriteReview from './pages/WriteReview'

function App() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/write-review" element={<WriteReview />} />
      </Routes>
    </div>
  )
}

export default App