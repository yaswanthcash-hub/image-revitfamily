import { useEffect, useRef } from 'react'
import { ArrowRight, Play, Users, Clock, DollarSign } from 'lucide-react'

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const elements = hero.querySelectorAll('.hero-animate')
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-fade-in-up')
        el.classList.remove('opacity-0')
      }, 150 * index)
    })
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-transparent to-[#dc5f00]/5" />

      <div className="relative max-w-[1280px] mx-auto px-5 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <div className="hero-animate opacity-0">
              <span className="inline-flex items-center gap-2 text-[#dc5f00] text-sm uppercase tracking-widest font-medium">
                <span className="w-8 h-[2px] bg-[#dc5f00]" />
                AI-Powered BIM Workflow
              </span>
            </div>

            {/* Headline */}
            <h1 className="hero-animate opacity-0 text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
              Generate Revit Families in{' '}
              <span className="gradient-text">Minutes, Not Hours</span>
            </h1>

            {/* Subheadline */}
            <p className="hero-animate opacity-0 text-lg text-[#a3a1a1] leading-relaxed max-w-xl">
              Upload product images, add dimensions, and get parametric Revit families with 
              proper BIM structure. Save 60-80% of creation time.
            </p>

            {/* CTAs */}
            <div className="hero-animate opacity-0 flex flex-wrap gap-4">
              <a href="#upload" className="btn-primary inline-flex items-center gap-2">
                Upload Your First Image
                <ArrowRight size={18} />
              </a>
              <button className="btn-secondary inline-flex items-center gap-2">
                <Play size={18} />
                Watch Demo
              </button>
            </div>

            {/* Stats Row */}
            <div className="hero-animate opacity-0 pt-8 border-t border-[#515151]/50">
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Users className="text-[#dc5f00]" size={20} />
                  <div>
                    <p className="text-xl font-semibold">4.5M+</p>
                    <p className="text-xs text-[#666]">Revit Users</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-[#dc5f00]" size={20} />
                  <div>
                    <p className="text-xl font-semibold">200-500</p>
                    <p className="text-xs text-[#666]">Families/Year</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="text-[#dc5f00]" size={20} />
                  <div>
                    <p className="text-xl font-semibold">$36K-90K</p>
                    <p className="text-xs text-[#666]">Savings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="hero-animate opacity-0 relative">
            <div className="relative rounded-lg overflow-hidden border border-[#515151]/50">
              <img
                src="/hero-visual.jpg"
                alt="AI Revit Family Generation"
                className="w-full h-auto"
              />
              {/* Overlay Badge */}
              <div className="absolute bottom-4 left-4 bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#515151] rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#dc5f00] rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm font-medium">AI Processing</p>
                    <p className="text-xs text-[#666]">Detecting components...</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border border-[#dc5f00]/30 rounded-lg" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-[#515151]/50 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
