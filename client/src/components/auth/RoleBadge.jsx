function RoleBadge({ role }) {
  if (!role) {
    return null
  }

  if (role === 'student') {
    return (
      <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition-all duration-300">
        Student Account
      </div>
    )
  }

  return (
    <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition-all duration-300">
      Company Account
    </div>
  )
}

export default RoleBadge
