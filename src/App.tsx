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
import type { FurnitureCategory } from './data/furniture-categories'

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [detectedCategory, setDetectedCategory] = useState<FurnitureCategory | null>(null)
  const [dimensions, setDimensions] = useState<Record<string, number>>({})

  const handleCategoryDetected = (category: FurnitureCategory) => {
    setDetectedCategory(category)
    const dims: Record<string, number> = {}
    category.dimensions.forEach(d => { dims[d.key] = d.default })
    setDimensions(dims)
  }

  useEffect(() => {
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

    const timer = setTimeout(() => {
      document.querySelectorAll('.scroll-animate').forEach((el) => {
        if (!el.classList.contains('animate-fade-in-up')) {
          el.classList.add('opacity-0')
          observer.observe(el)
        }
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [analysisComplete])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navigation />
      <main>
        <Hero />
        <UploadSection
          onImageUpload={setUploadedImage}
          onAnalysisComplete={() => setAnalysisComplete(true)}
          onCategoryDetected={handleCategoryDetected}
        />
        {analysisComplete && uploadedImage && detectedCategory && (
          <>
            <AnalysisPreview imageUrl={uploadedImage} category={detectedCategory} />
            <Preview3D category={detectedCategory} dimensions={dimensions} />
            <ParameterEditor
              category={detectedCategory}
              dimensions={dimensions}
              setDimensions={setDimensions}
            />
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
