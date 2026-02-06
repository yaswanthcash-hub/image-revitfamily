import { Brain, Box, ShieldCheck, Eye, Layers, Plug, FileText, Cloud, Cpu, CheckCircle } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'Wonder3D++ Reconstruction',
      description: 'State-of-the-art cross-domain diffusion generates RGB + normal maps simultaneously. 88-92% geometric accuracy—far superior to single-view methods.'
    },
    {
      icon: Box,
      title: 'Point2CAD Conversion',
      description: 'Reverse-engineers 3D meshes into parametric B-rep structure with analytical primitives. Achieves 94.3% accuracy on CAD reconstruction.'
    },
    {
      icon: Cpu,
      title: 'BRepNet Classification',
      description: 'First neural network operating directly on native B-rep structures. Classifies CAD operations with 4x fewer parameters than PointNet++.'
    },
    {
      icon: FileText,
      title: 'Catalog OCR Extraction',
      description: 'PaddleOCR extracts dimensional specifications from manufacturer PDFs with 98% accuracy. No more manual data entry from spec sheets.'
    },
    {
      icon: Cloud,
      title: 'Cloud Revit Generation',
      description: 'Autodesk Design Automation API creates families in the cloud—no local Revit installation needed. Scalable to thousands of families.'
    },
    {
      icon: Layers,
      title: 'Template Matching',
      description: '20+ hand-crafted Revit templates matched using ICP algorithm. Hybrid AI + template approach achieves higher accuracy than pure generation.'
    },
    {
      icon: Eye,
      title: 'Interactive 3D Preview',
      description: 'Review your family in real-time with Three.js before export. Rotate, zoom, and verify geometry matches your expectations.'
    },
    {
      icon: ShieldCheck,
      title: 'BIM Standards Compliant',
      description: 'Follows Autodesk Revit Content Style Guide, NBS BIM Toolkit, COBie requirements, and ISO 19650 information standards.'
    },
    {
      icon: CheckCircle,
      title: 'Automated Validation',
      description: 'Every family is automatically checked for loadability, parameter functionality, file size limits, and BIM compliance before export.'
    },
    {
      icon: Plug,
      title: 'Revit Plugin (Team)',
      description: 'Direct import to your projects with our pyRevit-based plugin. Skip the download step and streamline your workflow.'
    },
    {
      icon: Layers,
      title: 'Batch Processing (Pro)',
      description: 'Upload up to 20 images at once for catalog processing. Perfect for manufacturers with large product lines.'
    },
    {
      icon: Brain,
      title: 'Active Learning',
      description: 'User corrections improve the model over time. The more you use CladeFamily, the better it gets at understanding your furniture.'
    }
  ]

  return (
    <section id="features" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Why Choose <span className="text-[#dc5f00]">CladeFamily?</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-3xl mx-auto">
            We combine the latest research in 3D reconstruction, parametric CAD conversion, 
            and cloud-based Revit generation. No other platform offers this level of technical sophistication.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="scroll-animate group p-6 border border-[#515151] rounded-lg bg-transparent hover:border-[#dc5f00] hover:-translate-y-1 transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#dc5f00]/20 transition-colors">
                <feature.icon className="text-[#dc5f00]" size={22} />
              </div>
              <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-[#a3a1a1] text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="scroll-animate mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '92-95%', label: 'Combined Accuracy' },
            { value: '10.2M', label: 'Training Objects' },
            { value: '<2 min', label: 'Avg Generation Time' },
            { value: '0.5s', label: 'Cloud Revit API' }
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-[#1a1b1f] border border-[#515151] rounded-lg">
              <div className="text-2xl font-bold text-[#dc5f00] mb-1">{stat.value}</div>
              <div className="text-sm text-[#666]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
