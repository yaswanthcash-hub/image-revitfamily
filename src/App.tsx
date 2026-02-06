import { useEffect, useState, useCallback, useMemo } from 'react'
import './App.css'
import Navigation from './sections/Navigation'
import Hero from './sections/Hero'
import CategorySelector from './sections/CategorySelector'
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
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [dimensions, setDimensions] = useState<Record<string, number>>({})
  const [materials, setMaterials] = useState<Record<string, string>>({})
  const [identityData, setIdentityData] = useState<Record<string, string>>({})

  const initCategoryDefaults = useCallback((cat: FurnitureCategory) => {
    const dims: Record<string, number> = {}
    cat.dimensions.forEach(d => { dims[d.key] = d.default })
    setDimensions(dims)

    const mats: Record<string, string> = {}
    cat.materials.forEach(m => { mats[m.key] = m.default })
    setMaterials(mats)

    setIdentityData({})
    setUploadedImage(null)
    setAnalysisComplete(false)
  }, [])

  const handleSelectCategory = useCallback((cat: FurnitureCategory) => {
    setSelectedCategory(cat)
    initCategoryDefaults(cat)
  }, [initCategoryDefaults])

  const observerDeps = useMemo(() => [selectedCategory, analysisComplete], [selectedCategory, analysisComplete])

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
  }, [observerDeps])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navigation />
      <main>
        <Hero />
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
        {selectedCategory && (
          <UploadSection
            category={selectedCategory}
            onImageUpload={setUploadedImage}
            onAnalysisComplete={() => setAnalysisComplete(true)}
          />
        )}
        {selectedCategory && analysisComplete && uploadedImage && (
          <>
            <AnalysisPreview imageUrl={uploadedImage} category={selectedCategory} />
            <Preview3D
              dimensions={dimensions}
              categoryId={selectedCategory.id}
              materials={materials}
            />
            <ParameterEditor
              category={selectedCategory}
              dimensions={dimensions}
              setDimensions={setDimensions}
              materials={materials}
              setMaterials={setMaterials}
              identityData={identityData}
              setIdentityData={setIdentityData}
            />
            <ValidationExport category={selectedCategory} />
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
