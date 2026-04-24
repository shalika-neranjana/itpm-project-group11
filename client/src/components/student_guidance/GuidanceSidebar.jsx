import { guidanceTabs } from './constants'

function GuidanceSidebar({ activeTab, onChange }) {
  return (
    <aside className="rounded-2xl border border-[#E8EAF0] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:self-start">
      <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
        Guidance Menu
      </p>

      <nav className="flex flex-col gap-2">
        {guidanceTabs.map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DB2FF] focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-[#EEF2FD] text-[#3B6FE8]'
                  : 'text-[#4B5563] hover:bg-[#F7F8FA] hover:text-[#1A1D27]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-[#3B6FE8]' : 'bg-[#D6DCE8]'}`} />
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default GuidanceSidebar
