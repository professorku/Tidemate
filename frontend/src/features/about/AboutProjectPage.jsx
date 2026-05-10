import { useState } from 'react'

import ProjectSignature from './components/ProjectSignature'
import { tabs } from './data/tabs'
import ApiTab from './sections/ApiTab'
import ArchitectureTab from './sections/ArchitectureTab'
import OverviewTab from './sections/OverviewTab'
import SecurityTab from './sections/SecurityTab'

const tabContent = {
  overview: <OverviewTab />,
  architecture: <ArchitectureTab />,
  security: <SecurityTab />,
  api: <ApiTab />,
}

export default function AboutProjectPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <main className="min-h-screen bg-[#071d32] text-white">
      <div className="w-full px-5 py-12 md:px-10 lg:px-16 xl:px-24">
        <div className="max-w-5xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-gold">
            TideMate project documentation
          </p>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-white/75">
            A technical walkthrough of TideMate: how the product works, how the
            codebase is structured, how access is protected, and which API routes
            support the application.
          </p>

          <div className="mt-10 flex flex-wrap gap-6 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 pb-3 text-sm font-extrabold transition ${
                  activeTab === tab.key
                    ? 'border-gold text-gold'
                    : 'border-transparent text-white/55 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {tabContent[activeTab]}

          <ProjectSignature />
        </div>
      </div>
    </main>
  )
}
