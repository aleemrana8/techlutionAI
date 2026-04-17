import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import ProjectsPage from '../pages/ProjectsPage'
import ProjectDetails from '../pages/ProjectDetails'
import ContactPage from '../pages/ContactPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/contact" element={<ContactPage />} />
    </Routes>
  )
}
