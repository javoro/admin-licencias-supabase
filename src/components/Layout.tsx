import { Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      <header className="app-header">
        <h1>🔑 Admin Licencias</h1>
        <nav className="app-nav">
          <NavLink
            to="/applications"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Aplicaciones
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  )
}
