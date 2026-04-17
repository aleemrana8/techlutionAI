export default function MarqueeTicker() {
  const items = [
    'LLM Integration',
    'RAG Systems',
    'AI Agents & Automation',
    'Computer Vision',
    'Healthcare AI',
    'n8n Automation',
    'DevOps & Cloud',
    'Data Pipelines',
    'OCR Processing',
    'Medical Billing',
    'HIPAA Compliance',
    'Azure & Docker',
    'Custom AI & ML Systems',
    'Web & App Development',
    'E-Commerce Solutions',
    'Revenue Cycle Management',
    'AI Voice Agents',
    'Cybersecurity Solutions',
    'EHR/EMR Systems',
    'Denial Management AI',
    'Blockchain & Web3',
    'UI/UX Design',
    'Mobile App Development',
    'Business Intelligence',
  ]

  // double the list so the seamless loop works
  const doubled = [...items, ...items]

  return (
    <div className="py-4 bg-slate-950/80 border-y border-white/5 overflow-hidden select-none md:backdrop-blur-sm">
      <div className="ticker flex">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center flex-shrink-0">
            <span className="text-slate-600 text-xs sm:text-[11px] font-semibold uppercase tracking-[0.22em] whitespace-nowrap px-7">
              {item}
            </span>
            <span className="text-orange-500/40 text-sm flex-shrink-0">·</span>
          </div>
        ))}
      </div>
    </div>
  )
}
