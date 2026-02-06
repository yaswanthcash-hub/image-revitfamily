import { useEffect, useState, useRef } from 'react'
import './App.css'
import Navigation from './sections/Navigation'
import Hero from './sections/Hero'
import DemoBanner from './sections/DemoBanner'
import SampleImages from './sections/SampleImages'
import RealUploadSection from './sections/RealUploadSection'
import ProjectDashboard from './sections/ProjectDashboard'
import Features from './sections/Features'
import Technology from './sections/Technology'
import HowItWorks from './sections/HowItWorks'
import Pricing from './sections/Pricing'
import Stats from './sections/Stats'
import CTABanner from './sections/CTABanner'
import Footer from './sections/Footer'
import APISetup from './sections/APISetup'
import { supabase, type Project } from './lib/supabase'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const uploadRef = useRef<{ setFromSample: (url: string, name: string, category: string) => void }>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects])
  }

  const handleSampleSelect = (imageUrl: string, name: string, category: string) => {
    if (uploadRef.current?.setFromSample) {
      uploadRef.current.setFromSample(imageUrl, name, category)
    }
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
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
  }, [projects])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DemoBanner />
      <Navigation />
      <main>
        <Hero />
        <SampleImages onSelectSample={handleSampleSelect} />
        <div id="upload">
          <RealUploadSection
            ref={uploadRef}
            onProjectCreated={handleProjectCreated}
          />
        </div>
        {!loading && (
          <ProjectDashboard projects={projects} onProjectsUpdate={setProjects} />
        )}
        <APISetup />
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
