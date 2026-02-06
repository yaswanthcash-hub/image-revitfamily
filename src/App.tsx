import { useEffect, useState } from 'react'
import './App.css'
import Navigation from './sections/Navigation'
import Hero from './sections/Hero'
import RealUploadSection from './sections/RealUploadSection'
import ProjectDashboard from './sections/ProjectDashboard'
import Features from './sections/Features'
import Technology from './sections/Technology'
import HowItWorks from './sections/HowItWorks'
import Pricing from './sections/Pricing'
import Stats from './sections/Stats'
import CTABanner from './sections/CTABanner'
import Footer from './sections/Footer'
import { supabase, type Project } from './lib/supabase'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

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
      <Navigation />
      <main>
        <Hero />
        <RealUploadSection onProjectCreated={handleProjectCreated} />
        {!loading && (
          <ProjectDashboard projects={projects} onProjectsUpdate={setProjects} />
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
