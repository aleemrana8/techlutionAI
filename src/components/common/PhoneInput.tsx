import { Phone } from 'lucide-react'

const COUNTRY_CODES = [
  { code: '+92',  flag: '🇵🇰' },
  { code: '+1',   flag: '🇺🇸' },
  { code: '+44',  flag: '🇬🇧' },
  { code: '+971', flag: '🇦🇪' },
  { code: '+966', flag: '🇸🇦' },
  { code: '+91',  flag: '🇮🇳' },
  { code: '+61',  flag: '🇦🇺' },
  { code: '+49',  flag: '🇩🇪' },
  { code: '+33',  flag: '🇫🇷' },
  { code: '+86',  flag: '🇨🇳' },
]

interface PhoneInputProps {
  countryCode: string
  phone: string
  onCountryCodeChange: (code: string) => void
  onPhoneChange: (phone: string) => void
  accent?: 'cyan' | 'orange'
  size?: 'sm' | 'md'
  required?: boolean
  placeholder?: string
}

export default function PhoneInput({ countryCode, phone, onCountryCodeChange, onPhoneChange, accent = 'orange', size = 'md', required, placeholder = '315 1664843' }: PhoneInputProps) {
  const border = accent === 'cyan' ? 'focus:border-cyan-500/50 focus:ring-cyan-500/20' : 'focus:border-orange-500/50 focus:ring-orange-500/20'
  const py = size === 'sm' ? 'py-2' : 'py-2.5'

  return (
    <div className="flex gap-2">
      <select
        value={countryCode}
        onChange={e => onCountryCodeChange(e.target.value)}
        className={`w-[5.5rem] bg-slate-800/50 border border-white/[0.06] text-slate-300 rounded-xl px-2 ${py} text-sm focus:outline-none focus:ring-1 ${border} transition-all`}
      >
        {COUNTRY_CODES.map(c => (
          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
        ))}
      </select>
      <div className="relative flex-1">
        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="tel"
          value={phone}
          onChange={e => onPhoneChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`w-full bg-white/[0.03] border border-white/[0.06] text-white rounded-xl pl-9 pr-3 ${py} text-sm placeholder-slate-600 focus:outline-none focus:ring-1 ${border} transition-all`}
        />
      </div>
    </div>
  )
}

export { COUNTRY_CODES }
