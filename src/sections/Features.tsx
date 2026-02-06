import { Brain, Box, ShieldCheck, Eye, Layers, Plug, FileText, Cloud, Cpu, CheckCircle, Palette, SlidersHorizontal } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: Layers,
      title: '6 Furniture Categories',
      description: 'Office chairs, dining tables, desks, storage cabinets, sofas, and lighting fixtures. Each with category-specific detection, dimensions, and Revit templates.'
    },
    {
      icon: Brain,
      title: 'AI Component Detection',
      description: '5-8 components detected per category with bounding boxes and confidence scores. Category-specific neural networks trained on industry furniture datasets.'
    },
    {
      icon: Box,
      title: 'Parametric 3D Preview',
      description: 'Six dedicated 3D models with real-time dimension and material updates. Coarse/Medium/Fine LOD switching matches Revit view representations.'
    },
    {
      icon: SlidersHorizontal,
      title: 'Full Revit Parameter Editor',
      description: 'Dimensions, Identity Data, Materials, and IFC/Standards across 4 tabs. Industry-standard ranges from BIFMA G1, ANSI, and ADA guidelines.'
    },
    {
      icon: Palette,
      title: 'Visual Material Editor',
      description: 'Category-specific material slots with color swatch preview. Changes propagate to the 3D preview in real-time for instant visual feedback.'
    },
    {
      icon: ShieldCheck,
      title: '23-Point Validation',
      description: '6 categories of automated checks: File & Metadata, Parametric Integrity, Geometry Quality, Parameter Standards, Subcategories, and Materials.'
    },
    {
      icon: FileText,
      title: 'IFC / Classification',
      description: 'OmniClass, Uniclass 2015, and IFC 4.3 entity mapping auto-populated from category. COBie-compliant identity data for FM handover.'
    },
    {
      icon: Cloud,
      title: 'Multi-Format Export',
      description: 'Revit Family (.rfa), Type Catalog (.txt), Documentation (.pdf), and IFC Export (.ifc). Compatible with Revit 2022-2025.'
    },
    {
      icon: Cpu,
      title: 'Wonder3D++ Reconstruction',
      description: 'Cross-domain diffusion generates RGB + normal maps simultaneously. 88-92% geometric accuracy from state-of-the-art 3D reconstruction.'
    },
    {
      icon: Eye,
      title: 'Interactive 3D Preview',
      description: 'Orbit, zoom, and inspect your family in real-time. Grid overlay, wireframe mode, and LOD switching for detailed geometry review.'
    },
    {
      icon: Plug,
      title: 'Revit Plugin (Team)',
      description: 'Direct import to your projects with our pyRevit-based plugin. Skip the download step and streamline your workflow.'
    },
    {
      icon: CheckCircle,
      title: 'BIM Standards Compliant',
      description: 'Follows Autodesk Content Style Guide, NBS BIM Toolkit, COBie requirements, ISO 19650, and IFC 4.3 property sets.'
    }
  ]

  return (
    <section id="features" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Why Choose <span className="text-[#dc5f00]">CladeFamily?</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-3xl mx-auto">
            6 furniture categories, 23 validation checks, industry-standard dimensions,
            and multi-format export. Built for BIM professionals who need accurate,
            standards-compliant Revit families.
          </p>
        </div>

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

        <div className="scroll-animate mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '6', label: 'Furniture Categories' },
            { value: '23', label: 'Validation Checks' },
            { value: '4', label: 'Export Formats' },
            { value: '92-95%', label: 'Combined Accuracy' }
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
