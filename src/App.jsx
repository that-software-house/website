import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import ServicesPage from './pages/ServicesPage'
import LegacyServicesPage from './pages/LegacyServicesPage'
import SeoPage from './pages/SeoPage'
import MarketingPage from './pages/MarketingPage'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Vault from './pages/Vault'
import ProjectDetail from './pages/ProjectDetail'
import Work from './pages/Work'
import Approach from './pages/Approach'
import Team from './pages/Team'
import AiLab from './pages/AiLab'
import AiSoftware from './pages/AiSoftware'
import CustomSoftware from './pages/CustomSoftware'
import ThankYou from './pages/ThankYou'
import DataInsights from './pages/DataInsights'
import VideoAnalyzer from './pages/VideoAnalyzer'
import ValidateIdea from './pages/ValidateIdea'
import BuildProduct from './pages/BuildProduct'
import ScaleProduct from './pages/ScaleProduct'
import ResetPassword from './pages/ResetPassword'
import SMBModernization from './pages/SMBModernization'
import EnterpriseAI from './pages/EnterpriseAI'
import FractionalLeadership from './pages/FractionalLeadership'
import SeoMarketing from './pages/SeoMarketing'
import SMBWebsites from './pages/SMBWebsites'
import WebsiteCostEstimator from './pages/WebsiteCostEstimator'
import LaunchReadiness from './pages/LaunchReadiness'
import CaseStudy from './pages/CaseStudy'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app app-shell">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/modernization" element={<SMBModernization />} />
          <Route path="/enterprise-ai" element={<EnterpriseAI />} />
          <Route path="/fractional-leadership" element={<FractionalLeadership />} />
          <Route path="/seo-marketing" element={<SeoMarketing />} />
          <Route path="/smb-websites" element={<SMBWebsites />} />
          <Route path="/work" element={<Work />} />
          <Route path="/approach" element={<Approach />} />
          <Route path="/team" element={<Team />} />
          <Route path="/ai-lab" element={<AiLab />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/about" element={<About />} />
          <Route path="/small-business-websites" element={<LegacyServicesPage />} />
          <Route path="/legacy/services" element={<LegacyServicesPage />} />
          <Route path="/seo" element={<SeoPage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/ai-software" element={<AiSoftware />} />
          <Route path="/custom-software" element={<CustomSoftware />} />
          <Route path="/validate-your-idea" element={<ValidateIdea />} />
          <Route path="/build-your-product" element={<BuildProduct />} />
          <Route path="/scale-your-product" element={<ScaleProduct />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/data-insights" element={<DataInsights />} />
          <Route path="/video-analyzer" element={<VideoAnalyzer />} />
          <Route path="/website-cost-estimator" element={<WebsiteCostEstimator />} />
          <Route path="/launch-readiness-checker" element={<LaunchReadiness />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/case-studies/:slug" element={<CaseStudy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
