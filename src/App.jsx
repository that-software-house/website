import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import ServicesPage from './pages/ServicesPage'
import SeoPage from './pages/SeoPage'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import AiSoftware from './pages/AiSoftware'
import CustomSoftware from './pages/CustomSoftware'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/seo" element={<SeoPage />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/ai-software" element={<AiSoftware />} />
          <Route path="/custom-software" element={<CustomSoftware />} />
        </Routes>
        <Footer />
        <ChatWidget />
      </div>
    </Router>
  )
}

export default App
