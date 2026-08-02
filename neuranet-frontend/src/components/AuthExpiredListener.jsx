import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * AuthExpiredListener
 * -----------------------------------------------------------------------
 * Mounted once, inside <HashRouter>. Listens for the 'neuranet:unauthorized'
 * event dispatched by api/axios.js on a 401 response, and is the ONLY
 * thing in the app allowed to redirect to /login as a result of an
 * expired/invalid token.
 *
 * Why this exists: previously api/axios.js wrote directly to
 * window.location.hash on 401. That's a raw, non-React navigation
 * happening inside a HashRouter, which already owns the URL via
 * <Navigate>/useNavigate. Multiple polling components (Dashboard,
 * SystemIndicator, NotificationsMenu) all firing at once meant multiple
 * independent 401s each tried to force-navigate on the same render tick,
 * two navigation systems fighting over the same URL, which is what
 * produced the repeated "Maximum update depth exceeded" React errors.
 * Routing through React Router's own navigate() here means there's a
 * single source of truth for URL changes again.
 */
export default function AuthExpiredListener() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function handleUnauthorized() {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true })
      }
    }

    window.addEventListener('neuranet:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('neuranet:unauthorized', handleUnauthorized)
  }, [navigate, location.pathname])

  return null
}
