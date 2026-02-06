import { ArrowRight, Sparkles } from 'lucide-react'

const CTABanner = () => {
  return (
    <section className="py-20 bg-[#dc5f00] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-5 text-center">
        <div className="scroll-animate">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
            <Sparkles size={16} className="text-white" />
            <span className="text-sm font-medium">Start for free today</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6">
            Ready to Transform Your BIM Workflow?
          </h2>
          
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of architects saving hours on family creation. 
            No credit card required to start.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="#upload"
              className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white px-8 py-4 rounded-lg font-medium uppercase tracking-wider hover:bg-white hover:text-[#0a0a0a] transition-all duration-200"
            >
              Start Free Trial
              <ArrowRight size={18} />
            </a>
            <button className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white/50 px-8 py-4 rounded-lg font-medium uppercase tracking-wider hover:border-white hover:bg-white/10 transition-all duration-200">
              Schedule Demo
            </button>
          </div>
          
          <p className="text-sm text-white/60 mt-6">
            Free tier includes 3 families/month. Upgrade anytime.
          </p>
        </div>
      </div>
    </section>
  )
}

export default CTABanner
