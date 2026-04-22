import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function getDeviceType(): string {
  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'TABLET'
  if (/mobile|android|iphone|ipod|opera mini|blackberry|phone/i.test(ua)) return 'MOBILE'
  return 'DESKTOP'
}

function getBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  return 'Other'
}

function getOS(): string {
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  return 'Other'
}

let sessionId: string | null = null
function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('visitor_sid')
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('visitor_sid', sessionId)
    }
  }
  return sessionId
}

function getPageName(path: string): string {
  if (path === '/') return 'Home'
  if (path === '/contact') return 'Contact'
  if (path === '/projects') return 'Projects'
  if (path.startsWith('/projects/')) return 'Project Details'
  const clean = path.replace(/^\//, '').replace(/-/g, ' ')
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}

export function useVisitorTracking() {
  const location = useLocation()
  const tracked = useRef(new Set<string>())

  useEffect(() => {
    // Skip admin routes
    if (location.pathname.startsWith('/admin')) return

    const pageKey = location.pathname + location.search
    if (tracked.current.has(pageKey)) return
    tracked.current.add(pageKey)

    // Build journey from all tracked pages
    const journeyKey = `visitor_journey_${getSessionId()}`
    const journey: string[] = JSON.parse(sessionStorage.getItem(journeyKey) || '[]')
    const pageName = getPageName(location.pathname)
    if (!journey.includes(pageName)) journey.push(pageName)
    sessionStorage.setItem(journeyKey, JSON.stringify(journey))

    const payload = {
      device: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      page: location.pathname,
      pagesVisited: journey,
      summary: journey.join(' → '),
      referrer: document.referrer || '',
      sessionId: getSessionId(),
    }

    fetch(`${API_URL}/visitor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}) // fire-and-forget
  }, [location.pathname, location.search])
}
