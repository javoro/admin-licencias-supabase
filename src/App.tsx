import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ApplicationsPage from './pages/ApplicationsPage'
import LicensesPage from './pages/LicensesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/applications" replace />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="applications/:id/licenses" element={<LicensesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
