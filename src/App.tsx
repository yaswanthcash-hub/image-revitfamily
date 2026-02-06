import { useEffect, useState } from 'react'
import './App.css'
import Navigation from './sections/Navigation'
import Hero from './sections/Hero'
import UploadSection from './sections/UploadSection'
import AnalysisPreview from './sections/AnalysisPreview'
import Preview3D from './sections/Preview3D'
import ParameterEditor from './sections/ParameterEditor'
import ValidationExport from './sections/ValidationExport'
import Features from './sections/Features'
import Technology from './sections/Technology'
import HowItWorks from './sections/HowItWorks'
import Pricing from './sections/Pricing'
import Stats from './sections/Stats'
import CTABanner from './sections/CTABanner'
import Footer from './sections/Footer'

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [parameters, setParameters] = useState({
    manufacturer: '',
    model: '',
    cost: '',
    seatHeight: 18,
    overallHeight: 33,
    overallWidth: 24,
    depth: 24,
    hasArms: true,
    baseType: '5-Star'
  })

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
            entry.target.classList.remove('opacity-0')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      el.classList.add('opacity-0')
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navigation />
      <main>
        <Hero />
        <UploadSection 
          onImageUpload={setUploadedImage} 
          onAnalysisComplete={() => setAnalysisComplete(true)}
        />
        {analysisComplete && uploadedImage && (
          <>
            <AnalysisPreview imageUrl={uploadedImage} />
            <Preview3D parameters={parameters} />
            <ParameterEditor parameters={parameters} setParameters={setParameters} />
            <ValidationExport />
          </>
        )}
        <Features />
        <Technology />
        <HowItWorks />
        <Pricing />
        <Stats />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}

export default App
