import { Outlet, Navigate } from 'react-router-dom'
import { Topbar } from './Topbar'

export function Layout() {
  const user = localStorage.getItem('cv_integrity_user')
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <Topbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
